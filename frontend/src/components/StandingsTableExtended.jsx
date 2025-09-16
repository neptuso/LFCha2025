import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Box, Typography, LinearProgress } from '@mui/material';

const ResultBox = ({ result }) => {
  const color =
    result === 'G' ? 'success.main' :
    result === 'P' ? 'error.main' :
    'grey.700';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: '4px',
        backgroundColor: color,
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        margin: '0 2px',
      }}
    >
      {result}
    </Box>
  );
};

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
  return shields[teamName] || '/shields/default.png';
};

const getRowStyle = (position) => {
  if (position === 1) {
    return { borderLeft: `3px solid #8eff00`, backgroundColor: 'rgba(142, 255, 0, 0.05)' }; // Verde lima para el líder
  }
  if (position >= 2 && position <= 4) {
    return { borderLeft: `3px solid #00aeff`, backgroundColor: 'rgba(0, 174, 255, 0.05)' }; // Celeste para clasificación
  }
  // Podríamos añadir una regla para el descenso aquí si fuera necesario
  // if (position >= 13) {
  //   return { borderLeft: `3px solid #ff3d3d`, backgroundColor: 'rgba(255, 61, 61, 0.05)' };
  // }
  return { borderLeft: `3px solid transparent` }; // Borde transparente para mantener alineación
};

export default function StandingsTableExtended({ standings }) {
  if (!standings || standings.length === 0) {
    return <Typography sx={{ textAlign: 'center', p: 3 }}>No hay datos de posiciones para mostrar.</Typography>;
  }

  const maxPoints = Math.max(...standings.map(t => t.points), 0);

  return (
    <TableContainer>
      <Table size="small" aria-label="tabla de posiciones extendida">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>#</TableCell>
            <TableCell sx={{ width: '40%' }}>Equipo</TableCell>
            <TableCell align="center">PJ</TableCell>
            <TableCell align="center">G</TableCell>
            <TableCell align="center">E</TableCell>
            <TableCell align="center">P</TableCell>
            <TableCell align="center">Dif</TableCell>
            <TableCell sx={{ width: '15%' }}>Pts</TableCell>
            <TableCell align="center" sx={{ width: '15%' }}>Últimos 5</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((entry) => (
            <TableRow key={entry.team.id} sx={getRowStyle(entry.position)} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="bold">{entry.position}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img src={getShieldUrl(entry.team.name)} alt={entry.team.name} style={{ width: 24, height: 24, marginRight: 12 }} />
                  <Typography variant="body2" fontWeight="500">{entry.team.name}</Typography>
                </Box>
              </TableCell>
              <TableCell align="center">{entry.played}</TableCell>
              <TableCell align="center">{entry.won}</TableCell>
              <TableCell align="center">{entry.drawn}</TableCell>
              <TableCell align="center">{entry.lost}</TableCell>
              <TableCell align="center">{entry.goals_for - entry.goals_against}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ width: 25, textAlign: 'left' }}>{entry.points}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={maxPoints > 0 ? (entry.points / maxPoints) * 100 : 0}
                    sx={{
                      flexGrow: 1,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'primary.main'
                      }
                    }}
                  />
                </Box>
              </TableCell>
              <TableCell align="center">
                {entry.recent_results?.map((res, index) => (
                  <ResultBox key={index} result={res} />
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}