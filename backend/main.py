from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from models import Base
from services.sync_service import sync_matches, sync_events
from api import standings, matches, match_detail, top_scorers

app = FastAPI(title="Liga Chajarí by Nep - API")

# Configurar CORS (sin espacios)
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
    print("🚀 Iniciando sincronización de partidos...")
    sync_matches()
    print("🚀 Iniciando sincronización de eventos...")
    sync_events()
    return {
        "status": "success",
        "message": "Sincronización completa"
    }

@app.get("/healthz")
def health_check():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "Backend activo"}

# Incluir routers (sin doble /api)
app.include_router(standings.router)      # Ya tiene /api en el router
app.include_router(matches.router)       # Ya tiene /api en el router
app.include_router(match_detail.router)  # Ya tiene /api en el router
app.include_router(top_scorers.router)   # Ya tiene /api en el router