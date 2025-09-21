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
import { API_BASE } from '../services/api';

// Asignar puntos a las tarjetas para un ranking más significativo
const getCardPoints = (player) => {
  return (player.red_cards * 3) + player.yellow_cards;
};

export default function PlayerSanctionsWidget({ competitionId, zone }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competitionId) return;

    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE}/api/stats/player-sanctions/${competitionId}`;
        if (zone) {
          url += `?zone=${zone}`;
        }
        const response = await axios.get(url);
        // Ordenar por puntos de tarjeta en el frontend
        const sortedData = response.data.sort((a, b) => getCardPoints(b) - getCardPoints(a));
        setRanking(sortedData);
      } catch (err) {
        console.error("Error al cargar ranking de sanciones", err);
        setError("No se pudo cargar el ranking de sanciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [competitionId, zone]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>🟥 Ranking de Tarjetas</Typography>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jugador</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Equipo</TableCell>
                <TableCell align="center" sx={{ color: 'orange', fontWeight: 'bold' }}>🟨</TableCell>
                <TableCell align="center" sx={{ color: 'red', fontWeight: 'bold' }}>🟥</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Puntos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.slice(0, 10).map((player, index) => (
                <TableRow key={player.player_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.player_name}</TableCell>
                  <TableCell>{player.team_name}</TableCell>
                  <TableCell align="center">{player.yellow_cards}</TableCell>
                  <TableCell align="center">{player.red_cards}</TableCell>
                  <TableCell align="right">{getCardPoints(player)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
