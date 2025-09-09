import requests
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Match, Team, Competition, Player, Event
import os
from collections import defaultdict

# --- CONFIGURACIÓN ---
# Usamos la API Key 1, que devuelve el reporte de eventos completo.
API_KEY = os.getenv("COMET_API_KEY_1")
BASE_URL = "https://latam.analyticom.de/data-backend/api/public/areports/run"
# Usamos el Template ID del reporte de Eventos
EVENTS_TEMPLATE_ID = 3315314

# --- CACHÉ EN MEMORIA ---
competitions_cache = {}
teams_cache = {}
players_cache = {}

# --- HELPERS ---
def _get_or_create_competition(db: Session, match_info: dict):
    comp_name = match_info.get("competitionType", "Sin nombre")
    season = match_info.get("season", "Sin temporada")
    comp_key = (comp_name, season)
    if comp_key in competitions_cache: return competitions_cache[comp_key]
    competition = db.query(Competition).filter_by(name=comp_name, season=season).first()
    if competition:
        competitions_cache[comp_key] = competition
        return competition
    new_comp = Competition(name=comp_name, season=season, category=match_info.get("category"), gender=match_info.get("gender"))
    db.add(new_comp)
    db.flush()
    competitions_cache[comp_key] = new_comp
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
    return new_team

def _get_or_create_player(db: Session, event_row: dict, team_id: int):
    person_id = event_row.get("personId")
    if not person_id: return None
    if person_id in players_cache: return players_cache[person_id]
    player = db.query(Player).filter_by(person_id=person_id).first()
    if player:
        players_cache[person_id] = player
        return player
    new_player = Player(person_id=person_id, name=event_row.get("personName", "Desconocido"), team_id=team_id)
    db.add(new_player)
    db.flush()
    players_cache[person_id] = new_player
    return new_player

def run_reconstruction_sync():
    db = SessionLocal()
    if not API_KEY: 
        print("❌ Error: COMET_API_KEY_1 no está configurada.")
        return

    try:
        print("🚀 Iniciando Sincronización por Reconstrucción...")
        
        # --- PASO 1: OBTENER TODOS LOS EVENTOS DE LA API ---
        print("   Paso 1: Descargando todos los eventos de 2025...")
        all_events = []
        page = 0
        while True:
            url = f"{BASE_URL}/{EVENTS_TEMPLATE_ID}/{page}/999/?API_KEY={API_KEY}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            if not results: break
            
            for row in results:
                if row.get("season") == "2025":
                    all_events.append(row)
            
            print(f"      -> Página {page} de eventos descargada.")
            if page >= data.get("lastPage", 0): break
            page += 1
        print(f"   -> Se encontraron {len(all_events)} eventos para la temporada 2025.")

        # --- PASO 2: RECONSTRUIR PARTIDOS EN MEMORIA ---
        print("\n   Paso 2: Reconstruyendo partidos desde los eventos...")
        reconstructed_matches = {}
        for event in all_events:
            match_id = event.get("matchId")
            if not match_id: continue

            if match_id not in reconstructed_matches:
                desc = event.get("matchDescription", "")
                score_part = desc.split()[-1] if ":" in desc.split()[-1] else None
                teams_part = " ".join(desc.split()[:-1]) if score_part else desc
                teams_split = teams_part.split(" - ")
                home_name = teams_split[0].strip() if teams_split else "Desconocido"
                away_name = teams_split[1].strip() if len(teams_split) > 1 else "Desconocido"

                reconstructed_matches[match_id] = {
                    "match_info": event,
                    "home_name": home_name,
                    "away_name": away_name,
                    "home_team_ids": set(),
                    "away_team_ids": set()
                }
            
            team_id = event.get("teamId")
            if event.get("home") == "Sí":
                reconstructed_matches[match_id]["home_team_ids"].add(team_id)
            else:
                reconstructed_matches[match_id]["away_team_ids"].add(team_id)
        print(f"   -> Se reconstruyeron {len(reconstructed_matches)} partidos únicos.")

        # --- PASO 3: GUARDAR PARTIDOS EN DB ---
        print("\n   Paso 3: Guardando partidos reconstruidos en la base de datos...")
        existing_match_uids = {m.match_id_comet for m in db.query(Match.match_id_comet).all()}
        matches_to_commit = []
        for match_id, match_data in reconstructed_matches.items():
            if match_id in existing_match_uids: continue

            home_id = next(iter(match_data["home_team_ids"]),
 None)
            away_id = next(iter(match_data["away_team_ids"]),
 None)
            if not home_id or not away_id: continue

            competition = _get_or_create_competition(db, match_data["match_info"])
            home_team = _get_or_create_team(db, home_id, match_data["home_name"])
            away_team = _get_or_create_team(db, away_id, match_data["away_name"])
            if not competition or not home_team or not away_team: continue

            desc = match_data["match_info"].get("matchDescription", "")
            score_part = desc.split()[-1] if ":" in desc.split()[-1] else None
            home_score = int(score_part.split(":")[0]) if score_part and score_part.split(":")[0].isdigit() else None
            away_score = int(score_part.split(":")[1]) if score_part and len(score_part.split(":")) > 1 and score_part.split(":")[1].isdigit() else None

            new_match = Match(match_id_comet=match_id, competition_id=competition.id, home_team_id=home_team.id, away_team_id=away_team.id, date=datetime.fromtimestamp(match_data["match_info"].get("date") / 1000) if match_data["match_info"].get("date") else None, status=match_data["match_info"].get("matchStatus", "Desconocido"), round=str(match_data["match_info"].get("round", "")).strip() or None, home_score=home_score, away_score=away_score)
            matches_to_commit.append(new_match)
        
        if matches_to_commit:
            db.add_all(matches_to_commit)
            print(f"   -> {len(matches_to_commit)} partidos nuevos añadidos a la sesión.")

        # --- PASO 4: GUARDAR EVENTOS EN DB ---
        print("\n   Paso 4: Guardando eventos en la base de datos...")
        db.commit() # Guardar partidos para que los eventos puedan referenciarlos
        matches_cache = {m.match_id_comet: m.id for m in db.query(Match.match_id_comet, Match.id).all()}
        teams_cache.update({t.team_id_comet: t.id for t in db.query(Team.team_id_comet, Team.id).all()})
        events_to_commit = []
        for event_row in all_events:
            match_db_id = matches_cache.get(event_row.get("matchId"))
            if not match_db_id: continue
            team_db_id = teams_cache.get(event_row.get("teamId"))
            if not team_db_id: continue
            player = _get_or_create_player(db, event_row, team_db_id)
            if not player: continue

            if not db.query(Event).filter_by(match_id=match_db_id, player_id=player.id, event_type=event_row.get("matchEventType"), minute=event_row.get("minute")).first():
                new_event = Event(match_id=match_db_id, player_id=player.id, team_id=team_db_id, event_type=event_row.get("matchEventType"), sub_type=event_row.get("eventSubType"), minute=event_row.get("minute"), phase=event_row.get("phase"), is_home=event_row.get("home") == "Sí", stoppage_time=event_row.get("stoppageTime"))
                events_to_commit.append(new_event)

        if events_to_commit:
            db.add_all(events_to_commit)
            print(f"   -> {len(events_to_commit)} eventos nuevos añadidos a la sesión.")

        # --- PASO 5: COMMIT FINAL ---
        if matches_to_commit or events_to_commit:
            print("\n💾 Guardando todo en la base de datos...")
            db.commit()
            print("✅ COMMIT FINAL EXITOSO.")
        else:
            print("\nℹ️ No hay nada nuevo para guardar.")

    except Exception as e:
        print(f"❌ Error inesperado en la reconstrucción: {e}")
        db.rollback()
    finally:
        db.close()