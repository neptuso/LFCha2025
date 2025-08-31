@router.get("/api/stats/goals-by-minute")
def get_goals_by_minute(db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        Event.event_type == "Gol",
        Match.competition_id == 1
    )
    by_minute = [0] * 90
    for e in events:
        if e.minute and 0 <= e.minute < 90:
            by_minute[e.minute] += 1
    return {"minutes": by_minute}


@router.get("/api/stats/cards-by-team")
def get_cards_by_team(competition_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).join(Match).filter(
        Match.competition_id == competition_id,
        Event.event_type.in_(["Tarjeta amarilla", "Tarjeta roja"])
    )
    result = {}
    for e in events:
        team = db.query(Team).get(e.team_id)
        if team:
            name = team.name
            if name not in result: result[name] = 0
            result[name] += 1
    return sorted(result.items(), key=lambda x: -x[1])