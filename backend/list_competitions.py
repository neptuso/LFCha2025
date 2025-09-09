import requests
import os
import json
from dotenv import load_dotenv

# Carga las variables de entorno desde un archivo .env en el mismo directorio.
load_dotenv()

API_KEY = os.getenv("COMET_API_KEY_3")
BASE_URL = "https://api-latam.analyticom.de/competitions"

def list_available_competitions():
    """
    Consulta la API v1 para obtener una lista de todas las competiciones disponibles
    asociadas con la API Key proporcionada.
    """
    if not API_KEY:
        print("[Error] La variable de entorno COMET_API_KEY_3 no está configurada.")
        print("   Asegúrate de tener un archivo .env en el directorio 'backend' con el contenido: COMET_API_KEY_3='tu_api_key'")
        return

    # Usamos el header X-API-KEY según la documentación de los endpoints de datos.
    headers = {
        "X-API-KEY": API_KEY,
        "accept": "application/json"
    }

    print(f"[Info] Consultando competiciones en: {BASE_URL}")
    print(f"[Info] Usando API Key que termina en: ...{API_KEY[-4:] if API_KEY else 'N/A'}")

    try:
        response = requests.get(BASE_URL, headers=headers, timeout=20)
        response.raise_for_status()  # Lanza un error para respuestas 4xx/5xx

        competitions = response.json()

        print("[Success] ¡Consulta exitosa! Competiciones encontradas:")
        # Imprime la respuesta JSON de forma legible
        print(json.dumps(competitions, indent=2, ensure_ascii=False))

    except requests.exceptions.HTTPError as http_err:
        print(f"[Error] HTTP: {http_err.response.status_code} {http_err.response.reason}")
        print(f"   Detalles: {http_err.response.text}")
    except requests.exceptions.RequestException as req_err:
        print(f"[Error] Conexión: {req_err}")
    except Exception as e:
        print(f"[Error] Inesperado: {e}")

if __name__ == "__main__":
    list_available_competitions()
