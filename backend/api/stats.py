from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, case
from database import get_db
from models import Event, Match, Team, Player, TeamDisplay
import schemas
from typing import List
# Importar los nuevos servicios
from services.stats_service import get_clean_sheets_ranking, get_player_sanctions_ranking

router = APIRouter(prefix="/api/stats")

@router.get("/clean-sheets/{competition_id}")
def get_clean_sheets(competition_id: int, db: Session = Depends(get_db), zone: str = Query(None)):
    """
    Obtiene el ranking de vallas invictas para una competición y zona opcional.
    """
    return get_clean_sheets_ranking(db, competition_id=competition_id, zone=zone)

@router.get("/player-sanctions/{competition_id}")
def get_player_sanctions(competition_id: int, db: Session = Depends(get_db), zone: str = Query(None)):
    """
    Obtiene el ranking de tarjetas por jugador para una competición y zona opcional.
    """
    return get_player_sanctions_ranking(db, competition_id=competition_id, zone=zone)

@router.get("/goals-by-minute")
def get_goals_by_minute(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        func.lower(Event.event_type) == "goal",
        Match.competition_id == competition_id
    )
    by_minute = [0] * 90
    for e in events:
        if e.minute and 0 <= e.minute < 90:
            by_minute[e.minute] += 1
    return {"minutes": by_minute}

@router.get("/cards-by-team", response_model=List[schemas.TeamCardStats])
def get_cards_by_team(competition_id: int, db: Session = Depends(get_db)):
    """
    Calcula las estadísticas de tarjetas amarillas y rojas por equipo, incluyendo datos de visualización.
    """
    card_stats = (db.query(
        Team.name.label("team_name"),
        TeamDisplay.display_name,
        TeamDisplay.abbreviation,
        TeamDisplay.shield_url,
        func.count(case((func.lower(Event.event_type) == 'yellow card', 1))).label('yellow_cards'),
        func.count(case((func.lower(Event.event_type) == 'red card', 1))).label('red_cards')
    )
    .join(Event, Team.id == Event.team_id)
    .join(Match, Event.match_id == Match.id)
    .join(TeamDisplay, Team.id == TeamDisplay.team_id)
    .filter(Match.competition_id == competition_id)
    .filter(func.lower(Event.event_type).in_(['yellow card', 'red card']))
    .group_by(Team.name, TeamDisplay.display_name, TeamDisplay.abbreviation, TeamDisplay.shield_url)
    .order_by(func.count(case((func.lower(Event.event_type) == 'red card', 1))).desc(), func.count(case((func.lower(Event.event_type) == 'yellow card', 1))).desc())
    .all())
    
    return card_stats

@router.get("/top-scorers-by-team")
def get_top_scorers_by_team(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        func.lower(Event.event_type) == "goal",
        Match.competition_id == competition_id
    )
    by_team = {}
    for e in events:
        team = db.query(Team).get(e.team_id)
        player = db.query(Player).get(e.player_id)
        if not team or not player: 
            continue
        team_name = team.name
        if team_name not in by_team: 
            by_team[team_name] = {}
        if player.name not in by_team[team_name]: 
            by_team[team_name][player.name] = 0
        by_team[team_name][player.name] += 1

    result = {}
    for team, players in by_team.items():
        result[team] = sorted(players.items(), key=lambda x: -x[1])[:5]
    return result

@router.get("/avg-goals-per-match")
def get_avg_goals_per_match(competition_id: int, db: Session = Depends(get_db)):
    matches = db.query(Match).filter(Match.competition_id == competition_id).all()
    total_goals = 0
    valid_matches = 0
    for m in matches:
        if m.home_score is not None and m.away_score is not None:
            total_goals += m.home_score + m.away_score
            valid_matches += 1
    avg = total_goals / valid_matches if valid_matches > 0 else 0
    return {"average_goals_per_match": round(avg, 2), "total_matches": valid_matches}

@router.get("/streaks")
def get_streaks(competition_id: int, db: Session = Depends(get_db)):
    """
    Calcula las rachas de partidos ganados e invictos para todos los equipos de una competición.
    Esta versión está optimizada y tiene la lógica de rachas corregida.
    """
    HomeTeam = aliased(Team, name="home_team")
    AwayTeam = aliased(Team, name="away_team")

    matches_with_teams = db.query(
        Match,
        HomeTeam.name.label('home_team_name'),
        AwayTeam.name.label('away_team_name')
    ).join(HomeTeam, Match.home_team_id == HomeTeam.id)\
     .join(AwayTeam, Match.away_team_id == AwayTeam.id)\
     .filter(Match.competition_id == competition_id)\
     .order_by(Match.date.asc())\
     .all()

    # Primero, agrupar todos los partidos por equipo
    team_matches = {}
    for match, home_team_name, away_team_name in matches_with_teams:
        if home_team_name not in team_matches: team_matches[home_team_name] = []
        if away_team_name not in team_matches: team_matches[away_team_name] = []
        team_matches[home_team_name].append({"match": match, "location": "home"})
        team_matches[away_team_name].append({"match": match, "location": "away"})

    streaks = {}
    # Ahora, calcular las rachas para cada equipo iterando sus partidos
    for team_name, matches in team_matches.items():
        current_streaks = {"ganando": 0, "invicto": 0}
        for game in sorted(matches, key=lambda x: x['match'].date):
            match = game['match']
            if match.home_score is None or match.away_score is None:
                continue

            is_home = (game["location"] == "home")
            score = match.home_score if is_home else match.away_score
            opponent_score = match.away_score if is_home else match.home_score

            if score > opponent_score: # Victoria
                current_streaks["ganando"] += 1
                current_streaks["invicto"] += 1
            elif score == opponent_score: # Empate
                current_streaks["ganando"] = 0
                current_streaks["invicto"] += 1
            else: # Derrota
                current_streaks["ganando"] = 0
                current_streaks["invicto"] = 0
        
        streaks[team_name] = current_streaks
            
    return streaks