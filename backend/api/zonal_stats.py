from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["zonal_stats"]
)

@router.get("/zonal-standings", response_model=list[schemas.StandingEntry])
def get_zonal_standings(competition_name: str, db: Session = Depends(get_db)):
    # 1. Encontrar la competición por nombre
    competition = db.query(models.Competition).filter(models.Competition.name == competition_name).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competición no encontrada")

    # 2. Obtener todos los partidos finalizados de esa competición
    matches = db.query(models.Match).filter(
        models.Match.competition_id == competition.id,
        models.Match.home_score.isnot(None),
        models.Match.away_score.isnot(None)
    ).all()

    # 3. Calcular estadísticas
    stats_clubes = defaultdict(lambda: {
        'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 
        'goals_for': 0, 'goals_against': 0, 'points': 0,
        'team_info': None
    })

    for match in matches:
        home_team_id = match.home_team_id
        away_team_id = match.away_team_id

        # Guardar la información del equipo si es la primera vez que lo vemos
        if not stats_clubes[home_team_id]['team_info']:
            stats_clubes[home_team_id]['team_info'] = match.home_team
        if not stats_clubes[away_team_id]['team_info']:
            stats_clubes[away_team_id]['team_info'] = match.away_team

        # Actualizar partidos jugados
        stats_clubes[home_team_id]['played'] += 1
        stats_clubes[away_team_id]['played'] += 1

        # Actualizar goles
        stats_clubes[home_team_id]['goals_for'] += match.home_score
        stats_clubes[home_team_id]['goals_against'] += match.away_score
        stats_clubes[away_team_id]['goals_for'] += match.away_score
        stats_clubes[away_team_id]['goals_against'] += match.home_score

        # Determinar resultado y puntos
        if match.home_score > match.away_score:
            stats_clubes[home_team_id]['won'] += 1
            stats_clubes[home_team_id]['points'] += 3
            stats_clubes[away_team_id]['lost'] += 1
        elif match.away_score > match.home_score:
            stats_clubes[away_team_id]['won'] += 1
            stats_clubes[away_team_id]['points'] += 3
            stats_clubes[home_team_id]['lost'] += 1
        else:
            stats_clubes[home_team_id]['drawn'] += 1
            stats_clubes[away_team_id]['drawn'] += 1
            stats_clubes[home_team_id]['points'] += 1
            stats_clubes[away_team_id]['points'] += 1

    # 4. Ordenar la tabla
    # Primero convertimos el defaultdict a una lista
    lista_stats = list(stats_clubes.values())
    
    # Calculamos la diferencia de goles para el ordenamiento
    for stats in lista_stats:
        stats['goal_difference'] = stats['goals_for'] - stats['goals_against']

    tabla_ordenada = sorted(
        lista_stats, 
        key=lambda x: (x['points'], x['goal_difference']), 
        reverse=True
    )

    # 5. Formatear la salida según el schema StandingEntry
    tabla_final = []
    for i, stats in enumerate(tabla_ordenada):
        tabla_final.append(schemas.StandingEntry(
            position=i + 1,
            team=stats['team_info'],
            played=stats['played'],
            won=stats['won'],
            drawn=stats['drawn'],
            lost=stats['lost'],
            goals_for=stats['goals_for'],
            goals_against=stats['goals_against'],
            points=stats['points']
        ))

    return tabla_final