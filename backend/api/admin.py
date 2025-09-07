from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Match, Team, Competition, Player, Event

router = APIRouter(prefix="/api/admin")

@router.get("/matches")
def get_all_matches(db: Session = Depends(get_db)):
    return db.query(Match).all()

@router.get("/teams")
def get_all_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@router.get("/events")
def get_all_events(db: Session = Depends(get_db)):
    return db.query(Event).all()