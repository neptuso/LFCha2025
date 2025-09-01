from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.standings_service import calculate_standings

router = APIRouter(prefix="/api")

@router.get("/standings/{competition_id}")
def get_standings(competition_id: int, db: Session = Depends(get_db)):
    standings = calculate_standings(db, competition_id)
    return standings