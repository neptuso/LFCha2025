import React from 'react';

const H2HStats = ({ stats, team1Name, team2Name }) => {
  if (!stats || stats.total_matches === 0) {
    return (
      <div className="card mt-4">
        <div className="card-header">Historial (H2H)</div>
        <div className="card-body">
          <p className="text-center">No hay enfrentamientos previos registrados entre estos dos equipos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-header h5">Historial (H2H)</div>
      <div className="card-body">
        <div className="text-center mb-3 pb-2 border-bottom">
          <p className="h5 mb-1">{stats.total_matches} Partidos Jugados</p>
          <p className="text-muted mb-0">{stats.draws} Empates</p>
        </div>
        <div className="row align-items-center text-center">
          <div className="col">
            <h6 className="mb-1">{team1Name}</h6>
            <p className="h4 mb-1">{stats.team1_wins}</p>
            <p className="text-muted mb-0">Victorias</p>
            <hr className="my-2"/>
            <p className="h4 mb-1">{stats.team1_goals}</p>
            <p className="text-muted mb-0">Goles</p>
          </div>
          <div className="col-auto">
            <p className="h2 text-muted">VS</p>
          </div>
          <div className="col">
            <h6 className="mb-1">{team2Name}</h6>
            <p className="h4 mb-1">{stats.team2_wins}</p>
            <p className="text-muted mb-0">Victorias</p>
            <hr className="my-2"/>
            <p className="h4 mb-1">{stats.team2_goals}</p>
            <p className="text-muted mb-0">Goles</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default H2HStats;
