from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.standings_service import calculate_standings

router = APIRouter(prefix="/api")

''' @router.get("/standings/{competition_id}")
def get_standings(competition_id: int, db: Session = Depends(get_db)):
    standings = calculate_standings(db, competition_id)
    return standings '''

@router.get("/standings/{competition_id}")
def get_standings(
    competition_id: int, 
    db: Session = Depends(get_db),
    # Opcional: permitir limitar la cantidad de resultados
    limit: int = Query(100, description="Número máximo de equipos a mostrar")
):
    standings = calculate_standings(db, competition_id)
    # Si se especifica un límite, devolver solo los primeros 'limit' equipos
    if limit and isinstance(standings, list):
        return standings[:limit]
    return standings

