import requests
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Match, Team, Competition, Player, Event
import os

# --- CONFIGURACIÓN ---
API_KEY = os.getenv("COMET_API_KEY_3")
BASE_URL = "https://latam.analyticom.de/data-backend/api/public/areports/run"
MATCHES_TEMPLATE_ID = 3318704
EVENTS_TEMPLATE_ID = 3315314

# --- CACHÉ EN MEMORIA ---
competitions_cache = {}
teams_cache = {}
players_cache = {}
matches_cache = {}

# --- HELPERS ---
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

def _get_or_create_player(db: Session, row: dict, team_id: int):
    person_id = row.get("personId")
    if not person_id: return None
    if person_id in players_cache: return players_cache[person_id]
    player = db.query(Player).filter_by(person_id=person_id).first()
    if player:
        players_cache[person_id] = player
        return player
    new_player = Player(person_id=person_id, name=row.get("personName", "Desconocido"), team_id=team_id)
    db.add(new_player)
    db.flush()
    players_cache[person_id] = new_player
    return new_player

def run_final_sync():
    global competitions_cache, teams_cache, players_cache, matches_cache
    db = SessionLocal()
    if not API_KEY: 
        print("❌ Error: COMET_API_KEY_3 no está configurada.")
        return

    competitions_cache.clear(); teams_cache.clear(); players_cache.clear(); matches_cache.clear()

    try:
        print("🚀 Iniciando Sincronización Completa (V7)...")
        total_new_matches = 0
        total_new_events = 0
        changes_made = False

        # --- PASO 1: SINCRONIZAR PARTIDOS ---
        print("\n--- PASO 1: Sincronizando Partidos de 2025 ---")
        existing_match_uids = {m.match_id_comet for m in db.query(Match.match_id_comet).all()}
        page = 0
        while True:
            url = f"{BASE_URL}/{MATCHES_TEMPLATE_ID}/{page}/999/?API_KEY={API_KEY}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            results = data.get("results", [])
            if not results: break

            for row in results:
                if row.get("season") != "2025": continue
                match_id = row.get("matchId")
                if not match_id or match_id in existing_match_uids: continue
                home_team_id, away_team_id = row.get("homeTeam"), row.get("awayTeam")
                if not home_team_id or not away_team_id: continue

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

                new_match = Match(match_id_comet=match_id, competition_id=competition.id, home_team_id=home_team.id, away_team_id=away_team.id, date=datetime.fromtimestamp(row.get("matchDate") / 1000) if row.get("matchDate") else None, status=row.get("matchStatus", "Desconocido"), round=str(row.get("round", "")).strip() or None, home_score=home_score, away_score=away_score)
                db.add(new_match)
                existing_match_uids.add(match_id)
                total_new_matches += 1
                changes_made = True
            
            print(f"   -> Página {page} de partidos procesada.")
            if page >= data.get("lastPage", 0): break
            page += 1
        print(f"   -> Se añadieron {total_new_matches} partidos nuevos a la sesión.")

        # --- PASO 2: SINCRONIZAR EVENTOS ---
        print("\n--- PASO 2: Sincronizando Eventos de 2025 ---")
        EVENTS_API_KEY = os.getenv("COMET_API_KEY_1")
        if not EVENTS_API_KEY:
            print("⚠️  Advertencia: COMET_API_KEY_1 no está configurada. Saltando sincronización de eventos.")
        else:
            matches_cache = {m.match_id_comet: m.id for m in db.query(Match.match_id_comet, Match.id).all()}
            teams_cache.update({t.team_id_comet: t.id for t in db.query(Team.team_id_comet, Team.id).all()})
            page = 0
            while True:
                url = f"{BASE_URL}/{EVENTS_TEMPLATE_ID}/{page}/999/?API_KEY={EVENTS_API_KEY}"
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                if not results: break

                for row in results:
                    if row.get("season") != "2025": continue
                    
                    match_id_from_event = row.get("matchId")
                    

                    

                    match_db_id = matches_cache.get(match_id_from_event)
                    if not match_db_id:
                        print(f"    -> Ignorado: El Match ID {match_id_from_event} del evento no existe en nuestra DB.")
                        continue

                    team_db_id = teams_cache.get(row.get("teamId"))
                    if not team_db_id: continue
                    player = _get_or_create_player(db, row, team_db_id)
                    if not player: continue

                    existing_event = db.query(Event).filter_by(
                        match_id=match_db_id,
                        player_id=player.id,
                        event_type=row.get("matchEventType"),
                        minute=row.get("minute"),
                        phase=row.get("phase")
                    ).first()

                    is_home_correct = str(row.get("home")).lower() in ["sí", "yes"]

                    if existing_event:
                        if existing_event.is_home != is_home_correct:
                            existing_event.is_home = is_home_correct
                            changes_made = True
                            db.add(existing_event)
                            print(f"    -> Actualizado is_home para evento en match {match_db_id}, minuto {row.get('minute')}")
                    else:
                        new_event = Event(
                            match_id=match_db_id,
                            player_id=player.id,
                            team_id=team_db_id,
                            event_type=row.get("matchEventType"),
                            sub_type=row.get("eventSubType"),
                            minute=row.get("minute"),
                            phase=row.get("phase"),
                            is_home=is_home_correct,
                            stoppage_time=row.get("stoppageTime")
                        )
                        db.add(new_event)
                        total_new_events += 1
                        changes_made = True

                print(f"   -> Página {page} de eventos procesada.")
                if page >= data.get("lastPage", 0): break
                page += 1
            print(f"   -> Se añadieron {total_new_events} eventos nuevos a la sesión.")

        # --- PASO 3: GUARDAR TODO ---
        if changes_made:
            print(f"\n💾 Guardando {total_new_matches} partidos y {total_new_events} eventos nuevos...")
            db.commit()
            print("✅ COMMIT EXITOSO.")
        else:
            print("\nℹ️ No hay cambios nuevos para guardar.")

    except requests.exceptions.HTTPError as http_err:
        print(f"❌ Error HTTP: {http_err} - {http_err.response.text}")
        db.rollback()
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        db.rollback()
    finally:
        db.close()
