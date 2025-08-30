# backend/api/matches.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, aliased
from database import get_db
from models import Match, Team
from datetime import datetime

router = APIRouter()

@router.get("/api/matches")
def get_matches(
    date: str = Query(None, description="Filtrar por fecha (YYYY-MM-DD)"),
    team_id: int = Query(None, description="Filtrar por equipo (team_id_comet)"),
    db: Session = Depends(get_db)
):
    # Crear alias para los equipos
    HomeTeam = aliased(Team)
    AwayTeam = aliased(Team)

    query = db.query(Match).join(HomeTeam, Match.home_team_id == HomeTeam.id).join(AwayTeam, Match.away_team_id == AwayTeam.id)

    # Filtrar por fecha
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
            next_day = target_date.replace(hour=23, minute=59, second=59)
            query = query.filter(Match.date >= target_date, Match.date <= next_day)
        except ValueError:
            return {"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}

    # Filtrar por equipo
    if team_id:
        # Verificar que el equipo existe
        team_exists = db.query(Team).filter(Team.team_id_comet == team_id).first()
        if not team_exists:
            return {"error": f"Equipo con team_id_comet={team_id} no encontrado en la base de datos"}

        query = query.filter(
            (HomeTeam.team_id_comet == team_id) | (AwayTeam.team_id_comet == team_id)
        )

    matches = query.order_by(Match.date).all()

    if not matches:
        return {"message": "No se encontraron partidos con esos filtros"}

    result = []
    for match in matches:
        home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
        away_team = db.query(Team).filter(Team.id == match.away_team_id).first()

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
            "facility": match.facility
        })

    return result