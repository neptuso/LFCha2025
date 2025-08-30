import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer } from '@mui/material';

export default function StandingsTable({ standings }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Equipo</TableCell>
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
              <TableCell>{entry.position}</TableCell>
              <TableCell>{entry.team.name}</TableCell>
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