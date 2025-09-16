
import os
import sys
from sqlalchemy.orm import sessionmaker, joinedload
from sqlalchemy import create_engine

# Añadir el directorio padre a la ruta para permitir importaciones
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import Match, Event
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_match_scores():
    """
    Encuentra y corrige las inconsistencias en los marcadores y estados de los partidos.
    """
    db = SessionLocal()
    try:
        print("--- Iniciando reparación de marcadores y estados de partidos ---")
        
        # Cargar todos los partidos con sus equipos
        matches = db.query(Match).options(joinedload(Match.home_team), joinedload(Match.away_team)).all()
        
        updated_count = 0

        for match in matches:
            # Recalcular goles desde los eventos
            home_goals = db.query(Event).filter(
                Event.match_id == match.id,
                Event.event_type.in_(['Goal', 'Own goal', 'Penalty']),
                Event.team_id == match.home_team_id
            ).count()

            away_goals = db.query(Event).filter(
                Event.match_id == match.id,
                Event.event_type.in_(['Goal', 'Own goal', 'Penalty']),
                Event.team_id == match.away_team_id
            ).count()

            # Verificar si el marcador o el estado necesitan ser actualizados
            score_is_inconsistent = (match.home_score != home_goals) or (match.away_score != away_goals)
            status_is_inconsistent = (home_goals + away_goals > 0) and (match.status in ['SCHEDULED', 'ENTERED'])

            if score_is_inconsistent or status_is_inconsistent:
                updated_count += 1
                print(
                    f"  - Corrigiendo Partido ID: {match.id} ({match.home_team.name} vs {match.away_team.name})\n"
                    f"    - Antes: Marcador={match.home_score}-{match.away_score}, Estado='{match.status}'"
                )
                
                # Aplicar correcciones
                if score_is_inconsistent:
                    match.home_score = home_goals
                    match.away_score = away_goals
                
                if status_is_inconsistent:
                    match.status = 'PLAYED'

                print(f"    - Después: Marcador={match.home_score}-{match.away_score}, Estado='{match.status}'")

        if updated_count > 0:
            print(f"\nSe encontraron {updated_count} partidos para actualizar. Guardando cambios en la base de datos...")
            db.commit()
            print("¡Cambios guardados exitosamente!")
        else:
            print("\n✅ No se encontraron partidos que necesitaran corrección. La base de datos está consistente.")

    except Exception as e:
        print(f"\n❌ Ocurrió un error inesperado: {e}")
        print("Se cancelaron todos los cambios (rollback). La base de datos no ha sido modificada.")
        db.rollback()
    finally:
        db.close()
        print("--- Proceso de reparación terminado ---")

if __name__ == "__main__":
    fix_match_scores()
