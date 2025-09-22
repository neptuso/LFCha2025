import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { API_BASE } from '../../services/api';
import { getTeamDisplay } from '../../utils/teamDisplay'; // Importar la nueva utilidad
import axios from 'axios';

export default function TopStandingsWidget() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandingsData = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/standings-extended/1`);
        setStandings(response.data.slice(0, 5));
      } catch (err) {
        setError('No se pudo cargar la tabla de posiciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandingsData();
  }, []);

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
          {standings.map((team, index) => {
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
