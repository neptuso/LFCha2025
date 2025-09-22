import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { getTeamDisplay } from '../../utils/teamDisplay';

export default function TopStandingsWidget({ standings, loading, error }) {

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Tabla de Posiciones
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Equipo</TableCell>
            <TableCell align="right">Pts</TableCell>
            <TableCell align="right">PJ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings && standings.map((team, index) => {
            const display = getTeamDisplay(team.name);
            return (
              <TableRow key={team.team_id}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src={display.shield} alt={team.name} style={{ width: 20, height: 20, marginRight: 8 }} />
                    {display.abbr}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{team.points}</TableCell>
                <TableCell align="right">{team.played}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
