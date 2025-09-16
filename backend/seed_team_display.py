
import os
import sys
import re
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Añadir el directorio padre a la ruta para permitir importaciones
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import Team, TeamDisplay
from database import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Mapeo de escudos extraído del frontend
SHIELD_MAP = {
    'TIRO FEDERAL (CHAJARI)': '/shields/tiro_federal.png',
    'LA FLORIDA (CHAJARI)': '/shields/la_florida.png',
    'VELEZ SARSFIELD (CHAJARI)': '/shields/velez.png',
    'CHACARITA (CHAJARI)': '/shields/chacarita.png',
    'MOCORETA': '/shields/mocoreta.png',
    'SAN JOSE OBRERO': '/shields/san_jose_obrero.png', # Corregido para que coincida con el archivo real
    'SAN FRANCISCO (CHAJARI)': '/shields/san_francisco.png',
    'INDEPENDIENTE (CHAJARI)': '/shields/independiente.png',
    '1° DE MAYO (CHAJARI)': '/shields/prim_mayo.png', # Corregido para que coincida con el archivo real
    'SANTA ROSA (CHAJARI)': '/shields/santa_rosa.png',
    'FERROCARRIL': '/shields/ferrocarril.png',
    'SANTA ANA': '/shields/santa_ana.png',
    'SAN CLEMENTE (CHAJARI)': '/shields/san_clemente.png',
    'LOS CONQUISTADORES': '/shields/default.png' # Asumiendo un default para este
}

def generate_abbreviation(name: str) -> str:
    """Genera una abreviatura de 3 letras para un nombre de equipo."""
    # Limpia el nombre de caracteres especiales y lo pone en mayúsculas
    name = re.sub(r'[^A-Z0-9\s]', '', name.upper())
    words = name.split()
    
    if not words:
        return "N/A"
    
    if len(words) == 1:
        return words[0][:3]
    elif len(words) == 2:
        return (words[0][:2] + words[1][:1])
    else: # 3 o más palabras
        return "".join(word[0] for word in words[:3])

def seed_team_display_data():
    """
Puebla la tabla TeamDisplay con datos derivados de la tabla Team.
    """
    db = SessionLocal()
    try:
        print("--- Iniciando el sembrado de datos de TeamDisplay ---")
        teams = db.query(Team).all()
        if not teams:
            print("No se encontraron equipos en la base de datos.")
            return

        count_created = 0
        count_updated = 0

        for team in teams:
            # Verificar si ya existe una entrada para este equipo
            existing_display = db.query(TeamDisplay).filter_by(team_id=team.id).first()

            # 1. Limpiar el nombre
            display_name = re.sub(r'\s*\(CHAJARI\)\s*', '', team.name).strip()

            # 2. Generar abreviatura
            abbreviation = generate_abbreviation(display_name)

            # 3. Obtener URL del escudo
            shield_url = SHIELD_MAP.get(team.name, '/shields/default.png')

            if existing_display:
                # Actualizar si algo cambió
                if (
                    existing_display.display_name != display_name
                    or existing_display.abbreviation != abbreviation
                    or existing_display.shield_url != shield_url
                ):
                    
                    existing_display.display_name = display_name
                    existing_display.abbreviation = abbreviation
                    existing_display.shield_url = shield_url
                    db.add(existing_display)
                    count_updated += 1
                    print(f"  - Actualizando: {display_name}")
            else:
                # Crear nueva entrada
                new_display = TeamDisplay(
                    team_id=team.id,
                    display_name=display_name,
                    abbreviation=abbreviation,
                    shield_url=shield_url
                )
                db.add(new_display)
                count_created += 1
                print(f"  - Creando: {display_name} -> {abbreviation}")

        if count_created > 0 or count_updated > 0:
            print(f"\nSe crearon {count_created} y se actualizaron {count_updated} registros.")
            print("Guardando cambios en la base de datos...")
            db.commit()
            print("¡Cambios guardados!")
        else:
            print("\nNo se necesitaron cambios, los datos ya están actualizados.")

    except Exception as e:
        print(f"\n❌ Ocurrió un error: {e}")
        db.rollback()
    finally:
        db.close()
        print("\n--- Proceso de sembrado terminado ---")

if __name__ == "__main__":
    # Esto es necesario para que Alembic pueda detectar los nuevos modelos
    from database import Base
    from models import TeamDisplay
    print("Actualizando metadatos de la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Metadatos actualizados.")
    
    seed_team_display_data()
