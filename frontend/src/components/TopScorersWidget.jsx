import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

export default function TopScorersWidget({ competitionId, zone }) {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competitionId) return;

    const fetchScorers = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE}/api/top-scorers/${competitionId}`;
        if (zone) {
          url += `?zone=${zone}`;
        }
        const response = await axios.get(url);
        setScorers(response.data);
      } catch (err) {
        console.error("Error al cargar goleadores del widget", err);
        setError("No se pudieron cargar los goleadores.");
      } finally {
        setLoading(false);
      }
    };

    fetchScorers();
  }, [competitionId, zone]); // Se actualiza cuando cambia la competición o la zona

  return (
    <Box>
      <Typography variant="h6" gutterBottom>🏆 Top Goleadores</Typography>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jugador</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Equipo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Goles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scorers.slice(0, 10).map((scorer, index) => ( // Limitar a 10 por si acaso
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{scorer.player_name}</TableCell>
                  <TableCell>{scorer.team_name}</TableCell>
                  <TableCell align="right">{scorer.goals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
