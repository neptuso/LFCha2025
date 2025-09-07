from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Cargar variables de entorno (por si usas .env en el futuro)
load_dotenv()

# Definir la URL de la base de datos
DATABASE_URL = "sqlite:///ligachajari.db"


# Crear el motor de base de datos
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
