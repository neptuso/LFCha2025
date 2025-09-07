# backend/services/standings_service.py
from sqlalchemy.orm import Session
from models import Match, Team, Competition, Event

def calculate_standings(db: Session, competition_id: int):
    """
    Calcula la tabla de posiciones para una competición específica
    """
    # --- LOGS DE DEPURACIÓN ---
    print("-" * 50)
    print(f"[Debug] Se ha llamado a calculate_standings con competition_id: {competition_id}")

    # ✅ Verificar que la competición exista
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        print(f"[Debug] ERROR: No se encontró ninguna competición con el id {competition_id}.")
        return {"error": f"Competición con id={competition_id} no encontrada"}
    
    print(f"[Debug] Competición encontrada: '{competition.name}' (Temporada: {competition.season})")

    # ✅ Filtrar solo partidos de ESA competición
    matches = db.query(Match).filter(Match.competition_id == competition_id).all()
    print(f"[Debug] La consulta a la base de datos encontró {len(matches)} partidos para esta competición.")
    print("-" * 50)


    # Diccionario para acumular datos por equipo
    standings = {}

    for match in matches:
        if match.home_score is None or match.away_score is None:
            continue  # Partido no jugado

        home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
        away_team = db.query(Team).filter(Team.id == match.away_team_id).first()

        if not home_team or not away_team:
            continue

        # Inicializar equipos si no existen
        for team in [home_team, away_team]:
            if team.id not in standings:
                standings[team.id] = {
                    "team": team,
                    "played": 0, "won": 0, "drawn": 0, "lost": 0,
                    "goals_for": 0, "goals_against": 0, "points": 0
                }

        # Actualizar partidos jugados
        standings[home_team.id]["played"] += 1
        standings[away_team.id]["played"] += 1

        # Goles
        standings[home_team.id]["goals_for"] += match.home_score
        standings[home_team.id]["goals_against"] += match.away_score
        standings[away_team.id]["goals_for"] += match.away_score
        standings[away_team.id]["goals_against"] += match.home_score

        # Resultado
        if match.home_score > match.away_score:
            standings[home_team.id]["won"] += 1
            standings[away_team.id]["lost"] += 1
            standings[home_team.id]["points"] += 3
        elif match.home_score < match.away_score:
            standings[away_team.id]["won"] += 1
            standings[home_team.id]["lost"] += 1
            standings[away_team.id]["points"] += 3
        else:
            standings[home_team.id]["drawn"] += 1
            standings[away_team.id]["drawn"] += 1
            standings[home_team.id]["points"] += 1
            standings[away_team.id]["points"] += 1

    # Ordenar
    result = sorted(standings.values(), key=lambda x: (-x["points"], -(x["goals_for"] - x["goals_against"]), -x["goals_for"]))
    for i, entry in enumerate(result):
        entry["position"] = i + 1

    return result