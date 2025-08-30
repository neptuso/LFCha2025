# backend/services/top_scorers_service.py

from sqlalchemy.orm import Session
from models import Event, Player, Team, Match

def get_top_scorers(db: Session, competition_id: int, limit: int = 10):
    """
    Obtiene el top de goleadores de una competición
    """
    # Filtrar eventos de tipo "Gol" en partidos de la competición
    query = db.query(Event).join(Event.match).join(Event.player).join(Event.team).filter(
        Event.event_type == "Gol",
        Match.competition_id == competition_id
    )

    scorer_stats = {}
    for event in query:
        player = event.player
        team = event.team
        if player.id not in scorer_stats:
            scorer_stats[player.id] = {
                "player_name": player.name,
                "team_name": team.name,
                "goals": 0
            }
        scorer_stats[player.id]["goals"] += 1

    # Ordenar por goles y limitar
    result = sorted(scorer_stats.values(), key=lambda x: -x["goals"])[:limit]
    return result