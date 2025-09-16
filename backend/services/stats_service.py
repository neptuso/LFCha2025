# backend/services/stats_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, case
from models import Match, Team, Event, Player
from collections import defaultdict

def get_clean_sheets_ranking(db: Session, competition_id: int, zone: str = None):
    """
    Calcula el ranking de equipos por vallas invictas (partidos sin recibir goles).
    Filtra por competición y, opcionalmente, por zona (incluyendo interzonales).
    """
    matches_query = db.query(Match).filter(Match.competition_id == competition_id)

    if zone:
        zone_matches = matches_query.filter(Match.zone == zone).all()
        zone_team_ids = set()
        for match in zone_matches:
            if match.home_team_id: zone_team_ids.add(match.home_team_id)
            if match.away_team_id: zone_team_ids.add(match.away_team_id)

        if not zone_team_ids:
            return []

        matches = matches_query.filter(
            or_(Match.zone == zone, Match.zone == 'INTERZONAL'),
            or_(Match.home_team_id.in_(zone_team_ids), Match.away_team_id.in_(zone_team_ids))
        ).all()
    else:
        matches = matches_query.all()

    clean_sheets = defaultdict(lambda: {'team_id': 0, 'team_name': '', 'clean_sheets': 0, 'played': 0})
    processed_teams = set()

    for match in matches:
        if match.home_score is None or match.away_score is None: continue
        home_id, away_id = match.home_team_id, match.away_team_id

        if home_id not in processed_teams:
            team = db.query(Team).filter(Team.id == home_id).first()
            if team: 
                clean_sheets[home_id]['team_name'] = team.name
                clean_sheets[home_id]['team_id'] = home_id
                processed_teams.add(home_id)
        
        if home_id in clean_sheets:
            clean_sheets[home_id]['played'] += 1
            if match.away_score == 0:
                clean_sheets[home_id]['clean_sheets'] += 1

        if away_id not in processed_teams:
            team = db.query(Team).filter(Team.id == away_id).first()
            if team:
                clean_sheets[away_id]['team_name'] = team.name
                clean_sheets[away_id]['team_id'] = away_id
                processed_teams.add(away_id)

        if away_id in clean_sheets:
            clean_sheets[away_id]['played'] += 1
            if match.home_score == 0:
                clean_sheets[away_id]['clean_sheets'] += 1

    ranking = sorted(clean_sheets.values(), key=lambda x: (-x['clean_sheets'], x['played']))
    return ranking

def get_player_sanctions_ranking(db: Session, competition_id: int, zone: str = None):
    """
    Calcula el ranking de jugadores por tarjetas.
    """
    matches_query = db.query(Match.id).filter(Match.competition_id == competition_id)

    if zone:
        zone_matches = db.query(Match).filter(Match.competition_id == competition_id, Match.zone == zone).all()
        zone_team_ids = {m.home_team_id for m in zone_matches} | {m.away_team_id for m in zone_matches}
        
        if not zone_team_ids:
            return []

        match_ids = db.query(Match.id).filter(
            Match.competition_id == competition_id,
            or_(Match.zone == zone, Match.zone == 'INTERZONAL'),
            or_(Match.home_team_id.in_(zone_team_ids), Match.away_team_id.in_(zone_team_ids))
        ).scalar_subquery()
    else:
        match_ids = matches_query.scalar_subquery()

    # Contar tarjetas por jugador en los partidos filtrados (SINTAXIS CORREGIDA)
    sanctions_query = (db.query(
        Player.id,
        Player.name,
        Team.name.label('team_name'),
        func.count(case((func.lower(Event.event_type) == 'yellow card', 1))).label('yellow_cards'),
        func.count(case((func.lower(Event.event_type) == 'red card', 1))).label('red_cards')
    ).join(Player, Event.player_id == Player.id)
    .join(Team, Event.team_id == Team.id)
    .filter(Event.match_id.in_(match_ids))
    .filter(func.lower(Event.event_type).in_(['yellow card', 'red card']))
    .group_by(Player.id, Player.name, Team.name)
    .order_by(func.count(case((func.lower(Event.event_type) == 'red card', 1))).desc(), func.count(case((func.lower(Event.event_type) == 'yellow card', 1))).desc()))
    
    results = sanctions_query.all()

    # Formatear la salida
    ranking = [
        {
            "player_id": r.id,
            "player_name": r.name,
            "team_name": r.team_name,
            "yellow_cards": r.yellow_cards,
            "red_cards": r.red_cards,
            "total_cards": r.yellow_cards + r.red_cards
        }
        for r in results
    ]

    return ranking