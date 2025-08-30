from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TeamBase(BaseModel):
    id: int
    name: str

class PlayerBase(BaseModel):
    id: int
    name: str

class MatchBase(BaseModel):
    id: int
    home_team: TeamBase
    away_team: TeamBase
    date: datetime
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: str
    round: str

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