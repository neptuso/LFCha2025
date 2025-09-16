from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, case
from database import get_db
from models import Player, Event, Match, Team, TeamDisplay
import schemas
from typing import List

router = APIRouter(prefix="/api")

@router.get("/player/{player_id}", response_model=schemas.PlayerBase)
def get_player_details(player_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los detalles básicos de un jugador por su ID.
    """
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return player

@router.get("/player/{player_id}/goals", response_model=List[schemas.PlayerGoalDetail])
def get_player_goals(player_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la lista detallada de goles para un jugador específico.
    """
    player_team_id_sq = db.query(Player.team_id).filter(Player.id == player_id).subquery()
    HomeTeamDisplay = aliased(TeamDisplay)
    AwayTeamDisplay = aliased(TeamDisplay)

    goal_events = (db.query(
        Match.match_id_comet.label("match_id"),
        Match.date.label("match_date"),
        Event.minute,
        Event.event_type,
        Event.is_home.label("is_home_game"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, AwayTeamDisplay.display_name),
            else_=HomeTeamDisplay.display_name
        ).label("opponent_name"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, HomeTeamDisplay.shield_url),
            else_=AwayTeamDisplay.shield_url
        ).label("team_shield_url"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, AwayTeamDisplay.shield_url),
            else_=HomeTeamDisplay.shield_url
        ).label("opponent_shield_url")
    )
    .select_from(Event)
    .join(Match, Event.match_id == Match.id)
    .outerjoin(HomeTeamDisplay, Match.home_team_id == HomeTeamDisplay.team_id)
    .outerjoin(AwayTeamDisplay, Match.away_team_id == AwayTeamDisplay.team_id)
    .filter(
        Event.player_id == player_id,
        Event.event_type.in_(['Goal', 'Own goal', 'Penalty'])
    )
    .order_by(Match.date.desc())
    .all())

    return goal_events

@router.get("/player/{player_id}/sanctions", response_model=List[schemas.PlayerSanctionDetail])
def get_player_sanctions(player_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la lista detallada de sanciones para un jugador específico.
    """
    player_team_id_sq = db.query(Player.team_id).filter(Player.id == player_id).subquery()
    HomeTeamDisplay = aliased(TeamDisplay)
    AwayTeamDisplay = aliased(TeamDisplay)

    sanction_events = (db.query(
        Match.match_id_comet.label("match_id"),
        Match.date.label("match_date"),
        Event.minute,
        Event.event_type,
        Event.sub_type,
        Event.is_home.label("is_home_game"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, AwayTeamDisplay.display_name),
            else_=HomeTeamDisplay.display_name
        ).label("opponent_name"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, HomeTeamDisplay.shield_url),
            else_=AwayTeamDisplay.shield_url
        ).label("team_shield_url"),
        case(
            (Match.home_team_id == player_team_id_sq.c.team_id, AwayTeamDisplay.shield_url),
            else_=HomeTeamDisplay.shield_url
        ).label("opponent_shield_url")
    )
    .select_from(Event)
    .join(Match, Event.match_id == Match.id)
    .outerjoin(HomeTeamDisplay, Match.home_team_id == HomeTeamDisplay.team_id)
    .outerjoin(AwayTeamDisplay, Match.away_team_id == AwayTeamDisplay.team_id)
    .filter(
        Event.player_id == player_id,
        Event.event_type.in_(['Yellow card', 'Red card'])
    )
    .order_by(Match.date.desc())
    .all())

    return sanction_events