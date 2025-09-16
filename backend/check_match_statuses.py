import os
import sys
from sqlalchemy.orm import sessionmaker, joinedload
from sqlalchemy import create_engine, func

# Asegurarse de que los módulos del backend puedan ser importados
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import Base, Match, Event, Team
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_match_data_consistency():
    """
    Verifica la consistencia de los datos de los partidos en la base de datos.
    Busca partidos donde el marcador almacenado no coincide con los goles registrados.
    """
    db = SessionLocal()
    try:
        print("--- Iniciando verificación de consistencia de datos de partidos ---")

        # Obtener todos los partidos con sus equipos para evitar cargas perezosas
        matches = db.query(Match).options(joinedload(Match.home_team), joinedload(Match.away_team)).all()
        
        inconsistent_matches = []

        for match in matches:
            # Contar goles para el equipo local y visitante
            home_goals = db.query(Event).filter(
                Event.match_id == match.id,
                Event.event_type == "GOAL",
                Event.team_id == match.home_team_id
            ).count()

            away_goals = db.query(Event).filter(
                Event.match_id == match.id,
                Event.event_type == "GOAL",
                Event.team_id == match.away_team_id
            ).count()

            total_goals = home_goals + away_goals

            # Comprobar inconsistencias
            # 1. Hay goles registrados, pero el marcador en la DB es NULO
            condition1 = total_goals > 0 and (match.home_score is None or match.away_score is None)
            # 2. El marcador registrado en la DB no coincide con los goles contados
            condition2 = match.home_score != home_goals or match.away_score != away_goals

            if condition1 or condition2:
                inconsistent_matches.append({
                    "match": match,
                    "db_score": f"{match.home_score}-{match.away_score}",
                    "calculated_score": f"{home_goals}-{away_goals}"
                })

        if not inconsistent_matches:
            print("\n✅ No se encontraron inconsistencias en los datos de los partidos.")
        else:
            print(f"\n🚨 Se encontraron {len(inconsistent_matches)} partidos con datos inconsistentes:")
            for item in inconsistent_matches:
                match = item["match"]
                print(
                    f"  - Partido ID: {match.id} | {match.home_team.name} vs {match.away_team.name}\n"
                    f"    Fecha: {match.date} | Estado Actual: '{match.status}'\n"
                    f"    Resultado en DB:     {item['db_score']}\n"
                    f"    Goles Calculados:    {item['calculated_score']}\n"
                    f"    -> Problema: El resultado almacenado no refleja los goles registrados.\n"
                )

    finally:
        db.close()
        print("--- Verificación terminada ---")

if __name__ == "__main__":
    check_match_data_consistency()