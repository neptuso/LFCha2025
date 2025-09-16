from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Competition(Base):
    __tablename__ = "competitions"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    season = Column(String)
    category = Column(String)
    gender = Column(String)

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    team_id_comet = Column(Integer, unique=True, index=True)
    name = Column(String)
    parent_club_id = Column(Integer)
    association = Column(String)

    # Relación uno a uno con TeamDisplay
    display = relationship("TeamDisplay", backref="team", uselist=False, cascade="all, delete-orphan")

class TeamDisplay(Base):
    __tablename__ = "team_display"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    abbreviation = Column(String(3), nullable=False)
    shield_url = Column(String)

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True)
    person_id = Column(Integer, unique=True, index=True)
    name = Column(String)
    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team")

class Referee(Base):
    __tablename__ = "referees"
    id = Column(Integer, primary_key=True)
    referee_id = Column(Integer, unique=True, index=True)
    name = Column(String)
    gender = Column(String)
    nationality = Column(String)
    date_of_birth = Column(DateTime, nullable=True)

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True)
    match_id_comet = Column(Integer, unique=True, index=True)
    competition_id = Column(Integer, ForeignKey("competitions.id"))
    home_team_id = Column(Integer, ForeignKey("teams.id"))
    away_team_id = Column(Integer, ForeignKey("teams.id"))
    date = Column(DateTime)
    status = Column(String)
    facility = Column(String)
    referee_id = Column(Integer, ForeignKey("referees.id"))
    round = Column(String)
    zone = Column(String, nullable=True, index=True)
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)

    competition = relationship("Competition")
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    referee = relationship("Referee")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    event_type = Column(String)
    sub_type = Column(String, nullable=True)
    minute = Column(Integer)
    phase = Column(String)
    is_home = Column(Boolean)
    second_player_id = Column(Integer, nullable=True)
    accumulated_yellow = Column(String, nullable=True)
    stoppage_time = Column(Integer, nullable=True)

    match = relationship("Match")
    player = relationship("Player")
    team = relationship("Team")

# Clase faltante añadida para el registro de sincronizaciones
class SyncLog(Base):
    __tablename__ = 'sync_log'
    id = Column(Integer, primary_key=True)
    sync_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    records_processed = Column(Integer, nullable=False, default=0)