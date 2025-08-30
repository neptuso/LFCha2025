// frontend/src/pages/TopScorers.jsx

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

const API_BASE = 'http://127.0.0.1:8000';

export default function TopScorers() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScorers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/top-scorers/1`);
        setScorers(response.data);
      } catch (err) {
        console.error("Error al cargar goleadores", err);
        setError("No se pudieron cargar los goleadores. Verifica el backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchScorers();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>🏆 Top Goleadores</Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Jugador</TableCell>
                <TableCell>Equipo</TableCell>
                <TableCell align="right">Goles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scorers.map((scorer, index) => (
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