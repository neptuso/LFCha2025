from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine, NullPool
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Definir la URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")

# Crear el motor de base de datos
if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    # Usar NullPool para compatibilidad con PgBouncer (Supabase)
    engine = create_engine(DATABASE_URL, poolclass=NullPool)
else:
    print("ADVERTENCIA: No se encontró una DATABASE_URL de PostgreSQL. Usando SQLite local.")
    DATABASE_URL = "sqlite:///ligachajari.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Crear una sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

def get_db():
    """
    Dependencia para FastAPI: crea una sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  
