from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import Match, Event
import schemas
from typing import List

router = APIRouter(prefix="/api")

@router.get("/matches-with-stats", response_model=List[schemas.MatchWithStats])
def get_matches_with_stats(db: Session = Depends(get_db)):
    # Subquery for home events count
    home_events_sq = db.query(
        Event.match_id,
        func.count(Event.id).label("home_count")
    ).filter(Event.is_home == True).group_by(Event.match_id).subquery()

    # Subquery for away events count
    away_events_sq = db.query(
        Event.match_id,
        func.count(Event.id).label("away_count")
    ).filter(Event.is_home == False).group_by(Event.match_id).subquery()

    # Main query joining Match with event counts
    results = db.query(
        Match,
        func.coalesce(home_events_sq.c.home_count, 0).label("home_event_count"),
        func.coalesce(away_events_sq.c.away_count, 0).label("away_event_count")
    ).outerjoin(home_events_sq, Match.id == home_events_sq.c.match_id)\
     .outerjoin(away_events_sq, Match.id == away_events_sq.c.match_id)\
     .options(joinedload(Match.home_team), joinedload(Match.away_team))\
     .order_by(Match.date.desc()).all()

    # Map the tuple result to a list of objects that Pydantic can validate
    response_data = []
    for match, home_count, away_count in results:
        # Attach the counts to the match object so orm_mode can pick them up
        match.home_event_count = home_count
        match.away_event_count = away_count
        response_data.append(match)
    
    return response_data
