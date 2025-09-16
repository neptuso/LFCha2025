from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from services.standings_service import calculate_standings, calculate_standings_with_recent_results

router = APIRouter(prefix="/api")

@router.get("/standings/{competition_id}")
def get_standings(
    competition_id: int, 
    db: Session = Depends(get_db),
    zone: str = Query(None, description="Filtrar la tabla de posiciones por una zona específica (ej: A, B)"),
    limit: int = Query(100, description="Número máximo de equipos a mostrar")
):
    """
    Obtiene la tabla de posiciones para una competición.
    - **competition_id**: ID de la competición.
    - **zone**: (Opcional) Nombre de la zona para filtrar.
    - **limit**: (Opcional) Limita el número de equipos devueltos.
    """
    standings = calculate_standings(db, competition_id, zone=zone)
    
    if isinstance(standings, list) and limit:
        return standings[:limit]
        
    return standings

@router.get("/standings-extended/{competition_id}")
def get_standings_extended(
    competition_id: int, 
    db: Session = Depends(get_db),
    zone: str = Query(None, description="Filtrar la tabla de posiciones por una zona específica (ej: A, B)"),
    limit: int = Query(100, description="Número máximo de equipos a mostrar")
):
    """
    Obtiene la tabla de posiciones para una competición, incluyendo los últimos 5 resultados de cada equipo.
    """
    standings = calculate_standings_with_recent_results(db, competition_id, zone=zone)
    
    if isinstance(standings, list) and limit:
        return standings[:limit]
        
    return standings