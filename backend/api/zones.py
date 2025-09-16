from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.standings_service import get_zones_for_competition
from typing import List

router = APIRouter(prefix="/api", tags=["zones"])

@router.get("/competitions/{competition_id}/zones", response_model=List[str])
def get_competition_zones(competition_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una lista de nombres de zonas únicas para una competición específica.
    """
    zones = get_zones_for_competition(db, competition_id=competition_id)
    return zones
