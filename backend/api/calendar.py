from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, desc
from database import get_db
from models import Match, Competition, Team
from typing import List, Dict, Any

router = APIRouter(prefix="/api")

@router.get("/calendar-matches", response_model=List[int])
def get_calendar_matches(
    year: int = Query(..., description="Año para buscar partidos"),
    month: int = Query(..., description="Mes para buscar partidos"),
    db: Session = Depends(get_db)
):
    """
    Devuelve una lista de los días del mes especificado que tienen al menos un partido.
    """
    competition = db.query(Competition).filter(
        Competition.name == "PRIMERA DIVISIÓN",
        Competition.season == "2025"
    ).first()

    if not competition:
        return []

    days_with_matches_query = db.query(extract('day', Match.date).label("day")) \
        .filter(Match.competition_id == competition.id) \
        .filter(extract('year', Match.date) == year) \
        .filter(extract('month', Match.date) == month) \
        .distinct()

    days = [day[0] for day in days_with_matches_query.all()]
    
    return days

@router.get("/calendar-view")
def get_calendar_view_data(db: Session = Depends(get_db)) -> Dict[str, List[Dict[str, Any]]]:
    """
    Devuelve todos los partidos agrupados por mes y año para la vista de calendario.
    """
    competition = db.query(Competition).filter(
        Competition.name == "PRIMERA DIVISIÓN",
        Competition.season == "2025"
    ).first()

    if not competition:
        return {}

    matches = db.query(Match).filter(Match.competition_id == competition.id).order_by(desc(Match.date)).all()

    grouped_matches: Dict[str, List[Dict[str, Any]]] = {}
    
    for match in matches:
        if not match.date:
            continue
        
        month_year = match.date.strftime("%B %Y").upper()
        
        if month_year not in grouped_matches:
            grouped_matches[month_year] = []

        home_team = db.query(Team).get(match.home_team_id)
        away_team = db.query(Team).get(match.away_team_id)

        grouped_matches[month_year].append({
            "id": match.match_id_comet,
            "date": match.date.isoformat(),
            "home_team_name": home_team.name if home_team else "N/A",
            "away_team_name": away_team.name if away_team else "N/A",
            "home_score": match.home_score,
            "away_score": match.away_score,
            "facility": match.facility,
            "status": match.status,
            "round": match.round
        })

    return grouped_matches
