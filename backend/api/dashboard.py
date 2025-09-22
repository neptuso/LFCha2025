from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Match, Competition
from services.standings_service import calculate_standings_with_recent_results
from services.top_scorers_service import get_top_scorers
from typing import List

router = APIRouter(prefix="/api")

@router.get("/main-dashboard-data")
def get_main_dashboard_data(db: Session = Depends(get_db)):
    """
    Endpoint unificado que devuelve todos los datos necesarios para el dashboard principal.
    """
    # Asumimos la competición principal
    competition = db.query(Competition).filter(
        Competition.name == "PRIMERA DIVISIÓN",
        Competition.season == "2025"
    ).first()

    if not competition:
        return {
            "top_5_standings": [],
            "top_scorers": [],
            "last_round_matches": []
        }

    # 1. Obtener Top 5 de la tabla
    standings_data = calculate_standings_with_recent_results(db, competition.id)
    top_5_standings = standings_data[:5] if isinstance(standings_data, list) else []

    # 2. Obtener Top 5 Goleadores
    top_scorers_data = get_top_scorers(db, competition.id, limit=5)

    # 3. Obtener partidos de la última jornada disputada
    # Primero, encontrar el número de la última ronda con partidos finalizados
    latest_played_round_query = db.query(Match.round)\
        .filter(Match.competition_id == competition.id)\
        .filter(Match.status == 'played')\
        .order_by(Match.date.desc())\
        .first()
    
    last_round_matches_data = []
    if latest_played_round_query:
        latest_round_name = latest_played_round_query[0]
        # Luego, obtener todos los partidos de esa ronda
        matches_query = db.query(Match).filter(
            Match.competition_id == competition.id,
            Match.round == latest_round_name
        ).all()
        
        for match in matches_query:
            last_round_matches_data.append({
                "id": match.match_id_comet,
                "home_team_name": match.home_team.name,
                "away_team_name": match.away_team.name,
                "home_score": match.home_score,
                "away_score": match.away_score,
            })

    return {
        "top_5_standings": top_5_standings,
        "top_scorers": top_scorers_data,
        "last_round_matches": last_round_matches_data
    }
