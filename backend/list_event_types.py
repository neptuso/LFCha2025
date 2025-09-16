import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Añadir el directorio padre a la ruta para permitir importaciones
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import Event
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def list_unique_event_types():
    """
    Lista todas las combinaciones únicas de event_type y sub_type en la tabla de eventos.
    """
    db = SessionLocal()
    try:
        print("--- Buscando combinaciones únicas de event_type y sub_type ---")
        
        unique_types = db.query(Event.event_type, Event.sub_type).distinct().all()
        
        if not unique_types:
            print("No se encontraron eventos en la base de datos.")
            return

        print(f"Se encontraron {len(unique_types)} combinaciones únicas:")
        # Imprimir en un formato fácil de leer
        print("\n{:<25} | {:<25}".format('EVENT_TYPE', 'SUB_TYPE'))
        print("-" * 55)
        for event_type, sub_type in sorted(unique_types, key=lambda x: (x[0] or "", x[1] or "")):
            print("{:<25} | {:<25}".format(str(event_type), str(sub_type)))

    except Exception as e:
        print(f"\n❌ Ocurrió un error: {e}")
    finally:
        db.close()
        print("\n--- Búsqueda terminada ---")

if __name__ == "__main__":
    list_unique_event_types()