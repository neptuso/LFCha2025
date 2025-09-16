
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TeamBase(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class PlayerBase(BaseModel):
    id: int
    name: str

class MatchBase(BaseModel):
    id: int
    match_id_comet: int
    home_team: TeamBase
    away_team: TeamBase
    date: Optional[datetime]
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: str
    round: Optional[str]

    class Config:
        orm_mode = True

class MatchWithStats(MatchBase):
    facility: Optional[str] = None
    home_event_count: int
    away_event_count: int

class EventBase(BaseModel):
    type: str
    player: str
    team: str
    minute: int
    phase: str
    is_home: bool

class MatchDetail(MatchBase):
    events: List[EventBase]

class StandingEntry(BaseModel):
    team: TeamBase
    played: int
    won: int
    drawn: int
    lost: int
    goals_for: int
    goals_against: int
    points: int
    position: int

class TopScorer(BaseModel):
    player: str
    team: str
    goals: int

class TeamCardStats(BaseModel):
    team_name: str
    display_name: str
    abbreviation: str
    shield_url: str
    yellow_cards: int
    red_cards: int

    class Config:
        orm_mode = True

class PlayerGoalDetail(BaseModel):
    match_id: int
    match_date: Optional[datetime]
    opponent_name: str
    minute: int
    event_type: str
    is_home_game: bool
    team_shield_url: Optional[str]
    opponent_shield_url: Optional[str]

    class Config:
        orm_mode = True

class PlayerSanctionDetail(BaseModel):
    match_id: int
    match_date: Optional[datetime]
    opponent_name: str
    minute: Optional[int]
    event_type: str
    sub_type: Optional[str]
    is_home_game: bool
    team_shield_url: Optional[str]
    opponent_shield_url: Optional[str]

    class Config:
        orm_mode = True
