from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Event, Match, Team, Player

router = APIRouter(prefix="/api")

@router.get("/goals-by-minute")
def get_goals_by_minute(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        Event.event_type == "Gol",
        Match.competition_id == competition_id
    )
    by_minute = [0] * 90
    for e in events:
        if e.minute and 0 <= e.minute < 90:
            by_minute[e.minute] += 1
    return {"minutes": by_minute}

@router.get("/cards-by-team")
def get_cards_by_team(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        Match.competition_id == competition_id,
        Event.event_type.in_(["Tarjeta amarilla", "Tarjeta roja"])
    )
    result = {}
    for e in events:
        team = db.query(Team).get(e.team_id)
        if team:
            name = team.name
            if name not in result: 
                result[name] = {"amarillas": 0, "rojas": 0}
            if e.event_type == "Tarjeta amarilla":
                result[name]["amarillas"] += 1
            elif e.event_type == "Tarjeta roja":
                result[name]["rojas"] += 1
    return sorted(result.items(), key=lambda x: -(x[1]["amarillas"] + x[1]["rojas"]))

@router.get("/top-scorers-by-team")
def get_top_scorers_by_team(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        Event.event_type == "Gol",
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
    matches = db.query(Match).filter(Match.competition_id == competition_id).order_by(Match.date).all()
    streaks = {}
    
    for m in matches:
        if m.home_score is None or m.away_score is None: 
            continue
        
        home_team = db.query(Team).get(m.home_team_id)
        away_team = db.query(Team).get(m.away_team_id)
        
        if home_team:
            if home_team.name not in streaks: 
                streaks[home_team.name] = {"ganando": 0, "invicto": 0}
            if m.home_score > m.away_score:  # type: ignore
                streaks[home_team.name]["ganando"] += 1
                streaks[home_team.name]["invicto"] += 1
            elif m.home_score == m.away_score:  # pyright: ignore[reportGeneralTypeIssues]
                streaks[home_team.name]["invicto"] += 1
            else: 
                streaks[home_team.name]["ganando"] = 0
                streaks[home_team.name]["invicto"] = 0
            
        if away_team:
            if away_team.name not in streaks: 
                streaks[away_team.name] = {"ganando": 0, "invicto": 0}
            if m.away_score > m.home_score:  # pyright: ignore[reportGeneralTypeIssues]
                streaks[away_team.name]["ganando"] += 1
                streaks[away_team.name]["invicto"] += 1
            elif m.away_score == m.home_score:  # pyright: ignore[reportGeneralTypeIssues]
                streaks[away_team.name]["invicto"] += 1
            else: 
                streaks[away_team.name]["ganando"] = 0
                streaks[away_team.name]["invicto"] = 0
    
    return streaks