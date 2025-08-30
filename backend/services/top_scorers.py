# backend/services/top_scorers_service.py

from sqlalchemy.orm import Session
from models import Event, Player, Team

def get_top_scorers(db: Session, competition_id: int, limit: int = 10):
    query = db.query(Event).join(Event.player).join(Event.team).join(Match).filter(
        Event.event_type == "Gol",
        Match.competition_id == competition_id
    )

    scorer_stats = {}
    for event in query:
        player = event.player
        if player.id not in scorer_stats:
            scorer_stats[player.id] = {
                "player_name": player.name,
                "team_name": event.team.name,
                "goals": 0
            }
        scorer_stats[player.id]["goals"] += 1

    result = sorted(scorer_stats.values(), key=lambda x: -x["goals"])[:limit]
    return result