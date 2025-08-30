# backend/api/match_detail.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Match, Event, Player, Team

router = APIRouter()

@router.get("/api/match-detail/{match_id_comet}")
def get_match_detail(match_id_comet: int, db: Session = Depends(get_db)):
    # Buscar el partido
    match = db.query(Match).filter(Match.match_id_comet == match_id_comet).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    # Buscar eventos del partido
    events = db.query(Event).filter(Event.match_id == match.id).order_by(Event.minute).all()

    # Buscar equipos
    home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
    away_team = db.query(Team).filter(Team.id == match.away_team_id).first()

    result = {
        "match": {
            "id": match.match_id_comet,
            "home_team": home_team.name if home_team else "Desconocido",
            "away_team": away_team.name if away_team else "Desconocido",
            "home_score": match.home_score,
            "away_score": match.away_score,
            "date": match.date.isoformat() if match.date else None,
            "status": match.status,
            "round": match.round,
            "facility": match.facility
        },
        "events": []
    }

    for event in events:
        # Buscar jugador
        player = db.query(Player).filter(Player.id == event.player_id).first()
        player_name = player.name if player else "Jugador desconocido"

        # Buscar equipo del evento
        team = db.query(Team).filter(Team.id == event.team_id).first()
        team_name = team.name if team else "Equipo desconocido"

        result["events"].append({
            "type": event.event_type,
            "minute": event.minute,
            "phase": event.phase,
            "player": player_name,
            "team": team_name,
            "is_home": event.is_home,
            "sub_type": event.sub_type,
            "stoppage_time": event.stoppage_time,
            "accumulated_yellow": event.accumulated_yellow
        })

    return result