
import os
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from models import Event, Base

# --- Configuración de la Base de Datos ---
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'ligachajari.db'))
DATABASE_URL = f"sqlite:///{db_path}"

if not os.path.exists(db_path):
    print(f"Error: No se encontró el archivo de la base de datos en la ruta: {db_path}")
    exit()

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Script Principal ---
def check_distinct_events():
    db = SessionLocal()
    try:
        # La consulta para obtener los tipos y subtipos de eventos distintos
        distinct_events = db.query(Event.event_type, Event.sub_type).distinct().all()

        print("\n--- Tipos de Eventos y Sub-Tipos Únicos en la Base de Datos ---")
        if not distinct_events:
            print("No se encontraron eventos en la tabla 'Event'. La tabla está vacía.")
        else:
            # Usamos un conjunto para evitar imprimir duplicados si sub_type es None
            event_map = {}
            for event_type, sub_type in distinct_events:
                if event_type not in event_map:
                    event_map[event_type] = set()
                if sub_type is not None:
                    event_map[event_type].add(sub_type)

            for event_type, sub_types in sorted(event_map.items()):
                print(f"\nTipo de Evento: '{event_type}'")
                if sub_types:
                    for sub_type in sorted(sub_types):
                        print(f"  - Sub-Tipo: '{sub_type}'")
                else:
                    print("  (Sin sub-tipos registrados)")
        print("\n----------------------------------------------------------------")

    except Exception as e:
        print(f"\nOcurrió un error al consultar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_distinct_events()
