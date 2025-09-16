# backend/services/standings_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Match, Team, Competition

def calculate_standings(db: Session, competition_id: int, zone: str = None):
    """
    Calcula la tabla de posiciones para una competición específica.
    Si se proporciona una zona, calcula la tabla para esa zona incluyendo partidos interzonales.
    """
    print("-" * 50)
    log_msg = f"[Debug] Se ha llamado a calculate_standings con competition_id: {competition_id}"
    if zone:
        log_msg += f" y zone: '{zone}'"
    print(log_msg)

    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        return {"error": f"Competición con id={competition_id} no encontrada"}
    
    standings = {}
    team_ids_in_table = set()
    
    # --- Determinar los equipos y partidos a procesar ---
    if not zone:
        # MODO GENERAL: Procesar todos los partidos de la competición
        matches = db.query(Match).filter(
            Match.competition_id == competition_id,
            Match.status.in_(['PLAYED', 'CORRECT'])
        ).all()
        for match in matches:
            if match.home_team_id: team_ids_in_table.add(match.home_team_id)
            if match.away_team_id: team_ids_in_table.add(match.away_team_id)
    else:
        # MODO ZONA: Lógica compleja con interzonales
        # 1. Identificar equipos de la zona
        zone_matches = db.query(Match).filter(Match.competition_id == competition_id, Match.zone == zone).all()
        for match in zone_matches:
            if match.home_team_id: team_ids_in_table.add(match.home_team_id)
            if match.away_team_id: team_ids_in_table.add(match.away_team_id)

        if not team_ids_in_table:
            return []

        # 2. Obtener partidos de la zona + interzonales que involucren a esos equipos
        matches = db.query(Match).filter(
            Match.competition_id == competition_id,
            Match.status.in_(['PLAYED', 'CORRECT']),
            or_(Match.zone == zone, Match.zone == 'INTERZONAL'),
            or_(Match.home_team_id.in_(team_ids_in_table), Match.away_team_id.in_(team_ids_in_table))
        ).all()

    # --- Inicializar el diccionario de standings para los equipos relevantes ---
    teams_in_table = db.query(Team).filter(Team.id.in_(team_ids_in_table)).all()
    for team in teams_in_table:
        standings[team.id] = {
            "team": team, "played": 0, "won": 0, "drawn": 0, "lost": 0,
            "goals_for": 0, "goals_against": 0, "points": 0
        }

    # --- Procesar los partidos y calcular estadísticas ---
    for match in matches:
        if match.home_score is None or match.away_score is None: continue

        home_id, away_id = match.home_team_id, match.away_team_id
        home_score, away_score = match.home_score, match.away_score

        # Actualizar estadísticas para el equipo local si está en la tabla
        if home_id in standings:
            standings[home_id]['played'] += 1
            standings[home_id]['goals_for'] += home_score
            standings[home_id]['goals_against'] += away_score
            if home_score > away_score:
                standings[home_id]['won'] += 1
                standings[home_id]['points'] += 3
            elif home_score < away_score:
                standings[home_id]['lost'] += 1
            else:
                standings[home_id]['drawn'] += 1
                standings[home_id]['points'] += 1

        # Actualizar estadísticas para el equipo visitante si está en la tabla
        if away_id in standings:
            standings[away_id]['played'] += 1
            standings[away_id]['goals_for'] += away_score
            standings[away_id]['goals_against'] += home_score
            if away_score > home_score:
                standings[away_id]['won'] += 1
                standings[away_id]['points'] += 3
            elif away_score < home_score:
                standings[away_id]['lost'] += 1
            else:
                standings[away_id]['drawn'] += 1
                standings[away_id]['points'] += 1

    # --- Ordenar y devolver resultados ---
    result = sorted(standings.values(), key=lambda x: (-x["points"], -(x["goals_for"] - x["goals_against"]), -x["goals_for"]))
    for i, entry in enumerate(result):
        entry["position"] = i + 1

    return result

def get_zones_for_competition(db: Session, competition_id: int):
    """
    Obtiene una lista de todas las zonas únicas para una competición específica.
    """
    zones_query = db.query(Match.zone).filter(Match.competition_id == competition_id).distinct()
    zones = [zone[0] for zone in zones_query if zone[0] and zone[0].strip() != '']
    return sorted(zones)

def calculate_standings_with_recent_results(db: Session, competition_id: int, zone: str = None):
    """
    Calcula la tabla de posiciones y añade los resultados de los últimos 5 partidos de cada equipo.
    """
    # 1. Obtener la tabla de posiciones base
    standings_base = calculate_standings(db, competition_id, zone)

    if not isinstance(standings_base, list):
        return standings_base # Devolver error si lo hubiera

    # 2. Para cada equipo, obtener sus últimos 5 resultados
    for team_entry in standings_base:
        team_id = team_entry['team'].id
        
        # Consultar los últimos 5 partidos jugados por el equipo
        recent_matches = db.query(Match).filter(
            Match.competition_id == competition_id,
            or_(Match.home_team_id == team_id, Match.away_team_id == team_id),
            Match.status.in_(['PLAYED', 'CORRECT'])
        ).order_by(Match.date.desc()).limit(5).all()

        results = []
        for match in reversed(recent_matches): # Invertir para tener del más antiguo al más reciente
            if match.home_team_id == team_id:
                if match.home_score > match.away_score:
                    results.append('G') # Ganado
                elif match.home_score < match.away_score:
                    results.append('P') # Perdido
                else:
                    results.append('E') # Empatado
            else: # El equipo era visitante
                if match.away_score > match.home_score:
                    results.append('G')
                elif match.away_score < match.home_score:
                    results.append('P')
                else:
                    results.append('E')
        
        team_entry['recent_results'] = results

    return standings_base
