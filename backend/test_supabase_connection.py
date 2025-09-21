
import os
from sqlalchemy import text
from dotenv import load_dotenv
from database import engine, SessionLocal
from models import Team

# Cargar variables de entorno desde .env que debe estar en el directorio backend
load_dotenv()

def test_connection():
    """
    Prueba la conexión a la base de datos y realiza una consulta simple.
    """
    print("Intentando conectar a la base de datos...")
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: La variable de entorno DATABASE_URL no está definida.")
        print("Asegúrate de tener un archivo .env en el directorio 'backend' con la URL de tu base de datos de Supabase.")
        return

    print(f"URL de la base de datos encontrada: ...{db_url[-10:]}") # Muestra solo el final por seguridad

    print("\nIntentando leer la clave de API de COMET...")
    comet_api_key = os.getenv("COMET_API_KEY_3")
    if comet_api_key:
        print("\033[92m¡Éxito! La variable COMET_API_KEY_3 fue encontrada.\033[0m")
    else:
        print("\033[91mError: La variable de entorno COMET_API_KEY_3 no fue encontrada.\033[0m")

    try:
        # Intenta conectar al motor
        connection = engine.connect()
        print("¡Conexión al motor de la base de datos exitosa!")
        
        # Ahora, usa una sesión para hacer una consulta
        db = SessionLocal()
        print("Sesión de base de datos creada.")
        
        # Realiza una consulta simple para verificar que las tablas existen
        team_count = db.query(Team).count()
        
        print("\n-----------------------------------------")
        print(f"\033[92m¡Prueba exitosa!\033[0m")
        print(f"Se encontraron {team_count} equipos en la base de datos.")
        print("La conexión y la consulta a la tabla 'teams' funcionan correctamente.")
        print("-----------------------------------------")
        
        connection.close()
        db.close()

    except Exception as e:
        print("\n-----------------------------------------")
        print(f"\033[91mError durante la prueba de conexión:\033[0m")
        print(f"Detalle del error: {e}")
        print("Posibles causas:")
        print("1. La URL de la base de datos en tu archivo .env es incorrecta.")
        print("2. Las credenciales (usuario, contraseña, host) son inválidas.")
        print("3. El firewall o las reglas de red de Supabase están bloqueando la conexión.")
        print("4. La tabla 'teams' no existe. ¿Se han ejecutado las migraciones?")
        print("-----------------------------------------")

if __name__ == "__main__":
    test_connection()
