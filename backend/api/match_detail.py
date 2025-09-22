from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Match, Event, Player, Team

router = APIRouter(prefix="/api")

@router.get("/match-detail/{match_id_comet}")
def get_match_detail(match_id_comet: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.match_id_comet == match_id_comet).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    events = db.query(Event).filter(Event.match_id == match.id).order_by(Event.minute).all()

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
        player = db.query(Player).filter(Player.id == event.player_id).first()
        team = db.query(Team).filter(Team.id == event.team_id).first()

        event_data = {
            "type": event.event_type,
            "minute": event.minute,
            "phase": event.phase,
            "player": player.name if player else "Desconocido",
            "team": team.name if team else "Desconocido",
            "is_home": event.is_home,
            "sub_type": event.sub_type,
            "stoppage_time": event.stoppage_time,
            "accumulated_yellow": event.accumulated_yellow
        }

        # Si es una sustitución, buscar el nombre del segundo jugador
        if event.event_type == 'Substitution' and event.second_player_id:
            player_out = db.query(Player).filter(Player.id == event.second_player_id).first()
            event_data['player_out_name'] = player_out.name if player_out else "Desconocido"
        
        result["events"].append(event_data)

    return result
