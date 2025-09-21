import requests
import time
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import *
from dotenv import load_dotenv
import os

load_dotenv()

def timestamp_to_datetime(ts):
    return datetime.fromtimestamp(ts / 1000) if ts else None

def get_api_keys():
    return [
        os.getenv("COMET_API_KEY_1"),
        os.getenv("COMET_API_KEY_2"),
        os.getenv("COMET_API_KEY_3"),
    ]

# === CONFIGURACIÓN: Usa los templateId reales de tus reportes 2025 ===
MATCHES_TEMPLATE_ID = 3318704   # "Lista de Partidos 2025"
EVENTS_TEMPLATE_ID = 3315314    # "Eventos en Partidos 2025"

def sync_matches():
    db = SessionLocal()
    API_KEYS = get_api_keys()

    try:
        for API_KEY in API_KEYS:
            if not API_KEY:
                print("⚠️  API Key no configurada, saltando...")
                continue

            base_url = f"https://latam.analyticom.de/data-backend/api/public/areports/run/{MATCHES_TEMPLATE_ID}"
            page = 0
            while True:
                url = f"{base_url}/{page}/999/?API_KEY={API_KEY}"
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code != 200:
                        print(f"❌ Error en página {page}: {response.status_code}")
                        print(f"   URL: {url}")
                        break

                    data = response.json()
                    results = data.get("results", [])
                    last_page = data.get("lastPage", 0)

                    print(f"📄 Procesando página {page} de {last_page} (Partidos)...")

                    for row in results:
                        try:
                            match_id_comet = row.get("matchId")
                            if not match_id_comet:
                                continue

                            # Extraer equipos y resultado
                            desc = row.get("matchDescription", "")
                            score_part = desc.split()[-1] if ":" in desc.split()[-1] else None
                            teams_part = " ".join(desc.split()[:-1]) if score_part else desc
                            teams_split = teams_part.split(" - ")
                            home_name = teams_split[0].strip() if teams_split else "Desconocido"
                            away_name = teams_split[1].strip() if len(teams_split) > 1 else "Desconocido"

                            home_score = int(score_part.split(":")[0]) if score_part and score_part.split(":")[0].isdigit() else None
                            away_score = int(score_part.split(":")[1]) if score_part and len(score_part.split(":")) > 1 and score_part.split(":")[1].isdigit() else None

                            # Competición
                            comp_name = row.get("competitionType", "Sin nombre")
                            season = row.get("season", "Sin temporada")
                            category = row.get("category", "Sin categoría")
                            gender = row.get("gender", "Sin género")

                            competition = db.query(Competition).filter(
                                Competition.name == comp_name,
                                Competition.season == season
                            ).first()
                            if not competition:
                                competition = Competition(name=comp_name, season=season, category=category, gender=gender)
                                db.add(competition)
                                db.flush()

                            # Equipos
                            home_team_id_comet = row.get("homeTeam")
                            away_team_id_comet = row.get("awayTeam")

                            if not home_team_id_comet or not away_team_id_comet:
                                continue

                            home_team = db.query(Team).filter(Team.team_id_comet == home_team_id_comet).first()
                            if not home_team:
                                home_team = Team(
                                    team_id_comet=home_team_id_comet,
                                    name=home_name,
                                    association=row.get("assocName", "Desconocida")
                                )
                                db.add(home_team)
                                db.flush()

                            away_team = db.query(Team).filter(Team.team_id_comet == away_team_id_comet).first()
                            if not away_team:
                                away_team = Team(
                                    team_id_comet=away_team_id_comet,
                                    name=away_name,
                                    association=row.get("assocName", "Desconocida")
                                )
                                db.add(away_team)
                                db.flush()

                            # Árbitro (opcional)
                            referee_id = row.get("refereeId")
                            referee = None
                            if referee_id:
                                referee = db.query(Referee).filter(Referee.referee_id == referee_id).first()
                                if not referee:
                                    referee = Referee(
                                        referee_id=referee_id,
                                        name=row.get("refereeName", "Sin nombre"),
                                        gender=row.get("refereeGender"),
                                        nationality=row.get("refereeNationality"),
                                        date_of_birth=timestamp_to_datetime(row.get("refereeDateOfBirth"))
                                    )
                                    db.add(referee)
                                    db.flush()

                            # Partido
                            match = db.query(Match).filter(Match.match_id_comet == match_id_comet).first()
                            if not match:
                                match = Match(
                                    match_id_comet=match_id_comet,
                                    competition_id=competition.id,
                                    home_team_id=home_team.id,
                                    away_team_id=away_team.id,
                                    date=timestamp_to_datetime(row.get("matchDate")),
                                    status=row.get("matchStatus", "Desconocido"),
                                    facility=row.get("facility", "Sin estadio"),
                                    round=str(row.get("round", "")).strip() if row.get("round") not in [None, "-", ""] else None,
                                    referee_id=referee.id if referee else None,
                                    home_score=home_score,
                                    away_score=away_score
                                )
                                db.add(match)
                                db.commit()
                                print(f"✅ Partido {match_id_comet} sincronizado")
                            else:
                                print(f"⏭️  Partido {match_id_comet} ya existe")

                        except Exception as e:
                            db.rollback()
                            print(f"❌ Error en partido {match_id_comet}: {str(e)}")
                            continue

                    # ¿Hay más páginas?
                    if page >= last_page:
                        break
                    page += 1
                    time.sleep(0.1)  # Respetar límite

                except requests.exceptions.RequestException as e:
                    print(f"⚠️  Error de red: {str(e)}")
                    break
                except Exception as e:
                    print(f"❌ Error grave en página {page}: {str(e)}")
                    break

    except KeyboardInterrupt:
        print("\n🛑 Sincronización de partidos interrumpida por el usuario")
    except Exception as e:
        print(f"❌ Error inesperado en sync_matches: {str(e)}")
    finally:
        db.close()
        print("✅ Sincronización de partidos finalizada")

def sync_events():
    """
    Sincroniza todos los eventos (goles, tarjetas, sustituciones) de 2025
    """
    db = SessionLocal()
    API_KEYS = get_api_keys()

    try:
        for API_KEY in API_KEYS:
            if not API_KEY:
                print("⚠️  API Key no configurada, saltando...")
                continue

            page = 0
            while True:
                url = f"https://latam.analyticom.de/data-backend/api/public/areports/run/{EVENTS_TEMPLATE_ID}/{page}/999/?API_KEY={API_KEY}"
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code != 200:
                        print(f"❌ Error en página {page}: {response.status_code}")
                        print(f"   URL: {url}")
                        break

                    data = response.json()

                    # Validar que es el reporte correcto
                    report_name = data.get("reportName", "")
                    if report_name not in ["Eventos en Partidos", "Match Events"]:
                        print(f"⏭️  Reporte ignorado: {report_name}")
                        continue

                    # Extraer temporada
                    results = data.get("results", [])
                    season = results[0].get("season") if results else None
                    if not season or season != "2025":
                        print(f"⏭️  Temporada ignorada: {season}")
                        continue

                    last_page = data.get("lastPage", 0)
                    print(f"📄 Eventos - Procesando página {page} de {last_page}...")

                    for row in results:
                        try:
                            match_id_comet = row.get("matchId")
                            if not match_id_comet:
                                continue

                            # Buscar el partido en la base
                            match = db.query(Match).filter(Match.match_id_comet == match_id_comet).first()
                            if not match:
                                print(f"⚠️  Partido {match_id_comet} no encontrado. Se omitirá evento.")
                                continue

                            # Buscar o crear equipo
                            team_id_comet = row.get("teamId")
                            if not team_id_comet:
                                continue

                            team = db.query(Team).filter(Team.team_id_comet == team_id_comet).first()
                            if not team:
                                print(f"⚠️  Equipo {team_id_comet} no encontrado. Se omitirá.")
                                continue

                            # Buscar o crear jugador
                            person_id = row.get("personId")
                            if not person_id:
                                continue

                            player = db.query(Player).filter(Player.person_id == person_id).first()
                            if not player:
                                player = Player(
                                    person_id=person_id,
                                    name=row.get("personName", "Sin nombre"),
                                    team_id=team.id
                                )
                                db.add(player)
                                db.flush()

                            # Crear evento
                            event_type = row.get("matchEventType")
                            minute = row.get("minute")
                            phase = row.get("phase")
                            is_home = row.get("home") == "Sí"

                            event = Event(
                                match_id=match.id,
                                player_id=player.id,
                                team_id=team.id,
                                event_type=event_type,
                                sub_type=row.get("eventSubType"),
                                minute=minute,
                                phase=phase,
                                is_home=is_home,
                                stoppage_time=row.get("stoppageTime"),
                                accumulated_yellow=row.get("accumulatedYellow"),
                                second_player_id=row.get("secondPersonId")
                            )

                            # Evitar duplicados
                            existing = db.query(Event).filter(
                                Event.match_id == event.match_id,
                                Event.player_id == event.player_id,
                                Event.event_type == event.event_type,
                                Event.minute == event.minute,
                                Event.phase == event.phase
                            ).first()

                            if not existing:
                                db.add(event)
                                db.commit()
                                print(f"🎯 {event_type} en min {minute} ({match_id_comet})")
                            else:
                                print(f"🔁 Evento duplicado omitido")

                        except Exception as e:
                            db.rollback()
                            print(f"❌ Error en evento {row.get('id')}: {str(e)}")
                            continue

                    # ¿Hay más páginas?
                    if page >= last_page:
                        break
                    page += 1
                    time.sleep(0.1)  # Respetar límite

                except requests.exceptions.RequestException as e:
                    print(f"⚠️  Error de red: {str(e)}")
                    break
                except Exception as e:
                    print(f"❌ Error grave en página {page}: {str(e)}")
                    break

    except KeyboardInterrupt:
        print("\n🛑 Sincronización de eventos interrumpida por el usuario")
    except Exception as e:
        print(f"❌ Error inesperado en sync_events: {str(e)}")
    finally:
        db.close()
        print("✅ Sincronización de eventos finalizada")