def sync_matches():
    db = SessionLocal()
    API_KEYS = get_api_keys()
    
    # Contadores
    ignored_reports = 0
    ignored_seasons = 0
    
    for API_KEY in API_KEYS:
        if not API_KEY:
            print("⚠️ API Key no configurada, saltando...")
            continue

        base_url = f"https://latam.analyticom.de/data-backend/api/public/areports/run/{MATCHES_TEMPLATE_ID}"
        page = 0
        while True:
            url = f"{base_url}/{page}/999/?API_KEY={API_KEY}"
            try:
                response = requests.get(url, timeout=10)
                if response.status_code != 200:
                    print(f"❌ Error en página {page}: {response.status_code}")
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

                        desc = row.get("matchDescription", "")
                        score_part = desc.split()[-1] if ":" in desc.split()[-1] else None
                        teams_part = " ".join(desc.split()[:-1]) if score_part else desc
                        teams_split = teams_part.split(" - ")
                        home_name = teams_split[0].strip() if teams_split else "Desconocido"
                        away_name = teams_split[1].strip() if len(teams_split) > 1 else "Desconocido"

                        home_score = int(score_part.split(":")[0]) if score_part and score_part.split(":")[0].isdigit() else None
                        away_score = int(score_part.split(":")[1]) if score_part and len(score_part.split(":")) > 1 and score_part.split(":")[1].isdigit() else None

                        comp_name = row.get("competitionType", "Sin nombre")
                        season = row.get("season", "Sin temporada")
                        category = row.get("category", "Sin categoría")
                        gender = row.get("gender", "Sin género")

                        # Verificar temporada
                        if season != "2025":
                            ignored_seasons += 1
                            continue  # Salta si no es 2025

                        competition = db.query(Competition).filter(
                            Competition.name == comp_name,
                            Competition.season == season
                        ).first()
                        if not competition:
                            competition = Competition(name=comp_name, season=season, category=category, gender=gender)
                            db.add(competition)
                            db.flush()

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
                            print(f"⏭️ Partido {match_id_comet} ya existe")

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
                print(f"⚠️ Error de red: {str(e)}")
                break
            except Exception as e:
                print(f"❌ Error grave en página {page}: {str(e)}")
                break

    # Mostrar resumen al final
    if ignored_seasons > 0:
        print(f"📊 Ignoradas {ignored_seasons} temporadas no coincidentes con 2025")
    if ignored_reports > 0:
        print(f"📊 Ignorados {ignored_reports} reportes por error")

    db.close()
    print("✅ Sincronización de partidos finalizada")