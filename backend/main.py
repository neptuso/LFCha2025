from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from models import Base
from services.sync_service import run_final_sync
from api import standings, matches, match_detail, top_scorers, stats, admin, competitions, matches_with_stats, zonal_stats, zones, players

app =FastAPI(title="Liga Chajarí by Nep - API")

#Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://lfcha2025-f2.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Crear tablas
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/sync-data")
def sync_data(db: Session = Depends(get_db)):
    print("🚀 Ejecutando Sincronización Final...")
    run_final_sync()
    return {
        "status": "success",
        "message": "Sincronización Final iniciada."
    }

@app.get("/healthz")
def health_check():
    return{"status": "ok"}

@app.get("/")
def home():
    return{"message": "Backend activo"}

#Incluir routers
app.include_router(standings.router)
app.include_router(matches.router)
app.include_router(match_detail.router)
app.include_router(top_scorers.router)
app.include_router(stats.router)
app.include_router(competitions.router)
app.include_router(matches_with_stats.router)
app.include_router(zonal_stats.router)
app.include_router(zones.router)
app.include_router(players.router)