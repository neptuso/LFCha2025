import requests
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Match, Team, Competition, Referee
import os

# --- CONFIGURACIÓN DEFINITIVA ---
# Usamos la API Key 3, que devuelve la lista de partidos.
API_KEY = os.getenv("COMET_API_KEY_3") 
BASE_URL = "https://latam.analyticom.de/data-backend/api/public/areports/run"
# Usamos el Template ID del reporte "Lista de Partidos con Información General"
MATCHES_TEMPLATE_ID = 3318704

# --- CACHÉ EN MEMORIA ---
competitions_cache = {}
teams_cache = {}

def _get_or_create_competition(db: Session, row: dict):
    comp_name = row.get("competitionType", "Sin nombre")
    season = row.get("season", "Sin temporada")
    comp_key = (comp_name, season)
    if comp_key in competitions_cache: return competitions_cache[comp_key]
    
    competition = db.query(Competition).filter_by(name=comp_name, season=season).first()
    if competition:
        competitions_cache[comp_key] = competition
        return competition

    new_comp = Competition(name=comp_name, season=season, category=row.get("category"), gender=row.get("gender"))
    db.add(new_comp)
    db.flush()
    competitions_cache[comp_key] = new_comp
    print(f"    -> 🏆 Competición creada: {new_comp.name} ({new_comp.season})")
    return new_comp

def _get_or_create_team(db: Session, team_uid: int, team_name: str):
    if not team_uid: return None
    if team_uid in teams_cache: return teams_cache[team_uid]

    team = db.query(Team).filter_by(team_id_comet=team_uid).first()
    if team:
        teams_cache[team_uid] = team
        return team

    new_team = Team(team_id_comet=team_uid, name=team_name)
    db.add(new_team)
    db.flush()
    teams_cache[team_uid] = new_team
    print(f"    -> 👕 Equipo creado: {new_team.name}")
    return new_team

def run_final_sync():
    db = SessionLocal()
    if not API_KEY:
        # Pequeña ayuda por si la variable de entorno no está seteada
        print("❌ Error: COMET_API_KEY_3 no está configurada. Asegúrate de que el .env contiene la tercera API Key con ese nombre.")
        return

    competitions_cache.clear()
    teams_cache.clear()

    try:
        print("🚀 Iniciando Sincronización Final y Definitiva...")
        existing_match_uids = {m.match_id_comet for m in db.query(Match.match_id_comet).all()}
        print(f"[Info] Encontrados {len(existing_match_uids)} partidos existentes en la DB.")

        page = 0
        total_new_matches_added = 0
        while True:
            print(f"\n--- Procesando Página {page} del reporte de partidos ---")
            url = f"{BASE_URL}/{MATCHES_TEMPLATE_ID}/{page}/999/?API_KEY={API_KEY}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            last_page = data.get("lastPage", 0)

            if not results: break

            for row in results:
                if row.get("season") != "2025": continue
                
                match_id = row.get("matchId")
                if not match_id or match_id in existing_match_uids: continue

                home_team_id = row.get("homeTeam")
                away_team_id = row.get("awayTeam")
                
                if not home_team_id or not away_team_id:
                    continue

                desc = row.get("matchDescription", "")
                score_part = desc.split()[-1] if ":" in desc.split()[-1] else None
                teams_part = " ".join(desc.split()[:-1]) if score_part else desc
                teams_split = teams_part.split(" - ")
                home_name = teams_split[0].strip() if teams_split else "Desconocido"
                away_name = teams_split[1].strip() if len(teams_split) > 1 else "Desconocido"

                competition = _get_or_create_competition(db, row)
                home_team = _get_or_create_team(db, home_team_id, home_name)
                away_team = _get_or_create_team(db, away_team_id, away_name)
                
                if not competition or not home_team or not away_team: continue

                home_score = int(score_part.split(":")[0]) if score_part and score_part.split(":")[0].isdigit() else None
                away_score = int(score_part.split(":")[1]) if score_part and len(score_part.split(":")) > 1 and score_part.split(":")[1].isdigit() else None

                new_match = Match(
                    match_id_comet=match_id, competition_id=competition.id,
                    home_team_id=home_team.id, away_team_id=away_team.id,
                    date=datetime.fromtimestamp(row.get("matchDate") / 1000) if row.get("matchDate") else None,
                    status=row.get("matchStatus", "Desconocido"), round=str(row.get("round", "")).strip() or None,
                    home_score=home_score, away_score=away_score
                )
                db.add(new_match)
                existing_match_uids.add(match_id)
                total_new_matches_added += 1

            print(f"   -> Página {page} procesada. {total_new_matches_added} partidos nuevos añadidos hasta ahora.")
            if page >= last_page: break
            page += 1

        print("\n--- FIN DEL BUCLE ---")
        if total_new_matches_added > 0:
            print(f"💾 Guardando {total_new_matches_added} partidos nuevos...")
            db.commit()
            print("✅ COMMIT EXITOSO.")
        else:
            print("ℹ️ No hay partidos nuevos para guardar.")

    except requests.exceptions.HTTPError as http_err:
        print(f"❌ Error HTTP: {http_err} - {http_err.response.text}")
        db.rollback()
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        db.rollback()
    finally:
        db.close()
