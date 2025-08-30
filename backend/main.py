from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base
import models
from services.sync_service import sync_matches, sync_events
from api import standings
from api import matches
from api import match_detail
from api import top_scorers

app = FastAPI(title="Liga Chajarí by Nep - API")

# Permitir frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",  "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/sync-data")
def sync_data(db: Session = Depends(get_db)):
    """
    Endpoint para sincronizar partidos y eventos desde COMET API
    """
    print("🚀 Iniciando sincronización de partidos...")
    sync_matches()
    
    print("🚀 Iniciando sincronización de eventos...")
    sync_events()
    
    return {
        "status": "success",
        "message": "Sincronización completa: partidos y eventos actualizados"
    }

@app.get("/")
def home():
    return {"message": "Bienvenido a Liga Chajarí by Nep"}

app.include_router(standings.router)
app.include_router(matches.router)
app.include_router(match_detail.router)
app.include_router(top_scorers.router)
