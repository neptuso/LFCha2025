from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from models import Base
from services.sync_service import sync_matches, sync_events
from api import standings, matches, match_detail, top_scorers  # ✅ Importar top_scorers

app = FastAPI(title="Liga Chajarí by Nep - API")

# Configurar CORS
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

# Crear tablas (solo si no existen)
Base.metadata.create_all(bind=engine)

# Dependencia para la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint de sincronización
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

# Health check (para Render)
@app.get("/healthz")
def health_check():
    return {"status": "ok"}

# Ruta principal
@app.get("/")
def home():
    return {"message": "Bienvenido a Liga Chajarí by Nep - Backend activo"}

# Incluir routers
app.include_router(standings.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(match_detail.router, prefix="/api")
app.include_router(top_scorers.router, prefix="/api")  # ✅ Correcto