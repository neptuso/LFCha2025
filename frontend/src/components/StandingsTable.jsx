// tabla de posiciones
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer } from '@mui/material';

// Mapeo de nombres de equipos a archivos de escudos
const getShieldUrl = (teamName) => {
  const shields = {
    'TIRO FEDERAL (CHAJARI)': '/shields/tiro_federal.png',
    'LA FLORIDA (CHAJARI)': '/shields/la_florida.png',
    'VELEZ SARSFIELD (CHAJARI)': '/shields/velez.png',
    'CHACARITA (CHAJARI)': '/shields/chacarita.png',
    'MOCORETA': '/shields/mocoreta.png',
    'SAN JOSE OBRERO': '/shields/san_jose.png',
    'SAN FRANCISCO (CHAJARI)': '/shields/san_francisco.png',
    'INDEPENDIENTE (CHAJARI)': '/shields/independiente.png',
    '1° DE MAYO (CHAJARI)': '/shields/primero_de_mayo.png',
    'SANTA ROSA (CHAJARI)': '/shields/santa_rosa.png',
    'FERROCARRIL': '/shields/ferrocarril.png',
    'SANTA ANA': '/shields/santa_ana.png',
    'SAN CLEMENTE (CHAJARI)': '/shields/san_clemente.png',
    'LOS CONQUISTADORES': '/shields/los_conquistadores.png'
  };

  return shields[teamName] || '/shields/default.png'; // Escudo por defecto
};

export default function StandingsTable({ standings }) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'background.paper', width: 40 }}>#</TableCell>
            <TableCell sx={{ position: 'sticky', left: 40, zIndex: 2, backgroundColor: 'background.paper', minWidth: 250 }}>Equipo</TableCell>
            <TableCell align="right">PJ</TableCell>
            <TableCell align="right">G</TableCell>
            <TableCell align="right">E</TableCell>
            <TableCell align="right">P</TableCell>
            <TableCell align="right">GF</TableCell>
            <TableCell align="right">GC</TableCell>
            <TableCell align="right">Dif</TableCell>
            <TableCell align="right">Pts</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((entry) => (
            <TableRow key={entry.team.id}>
              <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper', width: 40 }}>{entry.position}</TableCell>
              <TableCell sx={{ position: 'sticky', left: 40, zIndex: 1, backgroundColor: 'background.paper' }}>
                <img
                  src={getShieldUrl(entry.team.name)}
                  alt={entry.team.name}
                  style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle' }}
                />
                <span style={{ verticalAlign: 'middle' }}>{entry.team.name}</span>
              </TableCell>
              <TableCell align="right">{entry.played}</TableCell>
              <TableCell align="right">{entry.won}</TableCell>
              <TableCell align="right">{entry.drawn}</TableCell>
              <TableCell align="right">{entry.lost}</TableCell>
              <TableCell align="right">{entry.goals_for}</TableCell>
              <TableCell align="right">{entry.goals_against}</TableCell>
              <TableCell align="right">{entry.goals_for - entry.goals_against}</TableCell>
              <TableCell align="right">{entry.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}