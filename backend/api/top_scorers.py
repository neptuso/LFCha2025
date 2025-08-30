# backend/api/top_scorers.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.top_scorers_service import get_top_scorers

router = APIRouter()

@router.get("/api/top-scorers/{competition_id}")
def get_scorers(competition_id: int, limit: int = 10, db: Session = Depends(get_db)):
    return get_top_scorers(db, competition_id, limit)