import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # Importa la Base de tus modelos existentes

# --- CONFIGURACIÓN ---
# Cargar la variable de entorno con la URL de la nueva DB
load_dotenv()
TARGET_DATABASE_URL = os.getenv("DATABASE_URL")

# URL de la base de datos de origen (tu archivo SQLite)
SOURCE_DATABASE_URL = "sqlite:///./ligachajari.db"

if not TARGET_DATABASE_URL or not TARGET_DATABASE_URL.startswith("postgresql"):
    raise Exception("No se encontró la variable de entorno DATABASE_URL para PostgreSQL. Asegúrate de que tu archivo .env está configurado correctamente.")

# --- MOTORES Y SESIONES ---
print("Conectando a las bases de datos...")
source_engine = create_engine(SOURCE_DATABASE_URL)
target_engine = create_engine(TARGET_DATABASE_URL)

SourceSession = sessionmaker(autocommit=False, autoflush=False, bind=source_engine)
TargetSession = sessionmaker(autocommit=False, autoflush=False, bind=target_engine)

# --- LÓGICA DE MIGRACIÓN ---
def migrate_data():
    print("\n--- Iniciando migración de base de datos ---")

    # 1. Crear todas las tablas en la base de datos de destino
    print("Paso 1: Creando esquemas de tablas en la base de datos de destino...")
    try:
        Base.metadata.create_all(target_engine)
        print("Esquemas de tablas creados con éxito.")
    except Exception as e:
        print(f"ERROR al crear las tablas: {e}")
        return

    source_session = SourceSession()
    target_session = TargetSession()

    # 2. Migrar datos tabla por tabla
    tables_to_migrate = Base.metadata.sorted_tables

    print(f"\nPaso 2: Migrando datos de {len(tables_to_migrate)} tablas...")

    for table in tables_to_migrate:
        model_class = None
        # Encontrar la clase del modelo correspondiente a la tabla
        for mapper in Base.registry.mappers:
            if mapper.local_table == table:
                model_class = mapper.class_
                break
        
        if not model_class:
            print(f"ADVERTENCIA: No se encontró una clase de modelo para la tabla '{table.name}'. Saltando.")
            continue

        print(f"  - Migrando tabla: '{table.name}'...")
        try:
            # Leer todos los datos de la tabla de origen
            records = source_session.query(model_class).all()
            
            if not records:
                print(f"    -> Tabla '{table.name}' está vacía. No hay datos para migrar.")
                continue

            # Copiar cada registro a la sesión de destino
            for record in records:
                # Desvincular el objeto de la sesión de origen para evitar errores
                source_session.expunge(record)
                # Fusionar el objeto en la sesión de destino.
                # --- Fix for Event.stoppage_time: convert empty string to None ---
                if model_class.__name__ == 'Event' and hasattr(record, 'stoppage_time') and record.stoppage_time == '':
                    record.stoppage_time = None
                # --- End Fix ---
                # --- Fix for Event.minute: convert empty string to None ---
                if model_class.__name__ == 'Event' and hasattr(record, 'minute') and record.minute == '':
                    record.minute = None
                # --- End Fix ---
                target_session.merge(record)

            # Confirmar los cambios para esta tabla
            target_session.commit()
            print(f"    -> ¡Éxito! {len(records)} registros migrados a '{table.name}'.")

        except Exception as e:
            print(f"    -> ERROR al migrar la tabla '{table.name}': {e}")
            target_session.rollback() # Revertir en caso de error en esta tabla

    source_session.close()
    target_session.close()
    print("\n--- Migración completada ---")

if __name__ == "__main__":
    migrate_data()
