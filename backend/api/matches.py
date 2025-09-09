from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, aliased
from database import get_db
from models import Match, Team, Competition, Event
from datetime import datetime

router = APIRouter(prefix="/api")

@router.get("/matches")
def get_matches(
    date: str = Query(None, description="Filtrar por fecha (YYYY-MM-DD)"),
    team_id: int = Query(None, description="Filtrar por equipo (team_id_comet)"),
    db: Session = Depends(get_db)
):
    # ✅ Buscar competición PRIMERA DIVISIÓN 2025
    competition = db.query(Competition).filter(
        Competition.name == "PRIMERA DIVISIÓN",
        Competition.season == "2025"
    ).first()
    
    if not competition:
        raise HTTPException(status_code=404, detail="Competición PRIMERA DIVISIÓN 2025 no encontrada")

    # Crear alias para los equipos
    HomeTeam = aliased(Team)
    AwayTeam = aliased(Team)

    # ✅ Filtrar solo partidos de PRIMERA DIVISIÓN 2025
    query = db.query(Match).join(HomeTeam, Match.home_team_id == HomeTeam.id).join(AwayTeam, Match.away_team_id == AwayTeam.id)
    query = query.filter(Match.competition_id == competition.id)

    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
            next_day = target_date.replace(hour=23, minute=59, second=59)
            query = query.filter(Match.date >= target_date, Match.date <= next_day)
        except ValueError:
            return {"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}

    if team_id:
        team_exists = db.query(Team).filter(Team.team_id_comet == team_id).first()
        if not team_exists:
            return {"error": f"Equipo con team_id_comet={team_id} no encontrado"}
        query = query.filter((HomeTeam.team_id_comet == team_id) | (AwayTeam.team_id_comet == team_id))

    matches = query.order_by(Match.date).all()

    if not matches:
        return {"message": "No se encontraron partidos con esos filtros"}

    result = []
    for match in matches:
        home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
        away_team = db.query(Team).filter(Team.id == match.away_team_id).first()

        # Contar eventos para cada equipo
        home_events_count = db.query(Event).filter(
            Event.match_id == match.id,
            Event.team_id == match.home_team_id
        ).count()
        away_events_count = db.query(Event).filter(
            Event.match_id == match.id,
            Event.team_id == match.away_team_id
        ).count()

        result.append({
            "id": match.match_id_comet,
            "home_team": {
                "id": home_team.id,
                "name": home_team.name,
                "team_id_comet": home_team.team_id_comet
            },
            "away_team": {
                "id": away_team.id,
                "name": away_team.name,
                "team_id_comet": away_team.team_id_comet
            },
            "date": match.date.isoformat() if match.date else None,
            "status": match.status,
            "round": match.round,
            "home_score": match.home_score,
            "away_score": match.away_score,
            "facility": match.facility,
            "home_team_events": home_events_count,
            "away_team_events": away_events_count
        })

    return result