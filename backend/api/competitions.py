# backend/api/competitions.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Competition

router = APIRouter(prefix="/api")

@router.get("/competitions")
def get_competitions(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las competiciones disponibles.
    """
    competitions = db.query(Competition).all()
    return [
        {
            "id": comp.id,
            "name": comp.name,
            "season": comp.season,
            "full_name": f"{comp.name} {comp.season}"
        }
        for comp in competitions
    ]
