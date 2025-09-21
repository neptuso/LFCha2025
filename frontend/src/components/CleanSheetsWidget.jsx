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


export default function CleanSheetsWidget({ competitionId, zone }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competitionId) return;

    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE}/api/stats/clean-sheets/${competitionId}`;
        if (zone) {
          url += `?zone=${zone}`;
        }
        const response = await axios.get(url);
        setRanking(response.data);
      } catch (err) {
        console.error("Error al cargar ranking de vallas invictas", err);
        setError("No se pudo cargar el ranking.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [competitionId, zone]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>🧤 Vallas Menos Vencidas</Typography>

      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Equipo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Vallas Invictas</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>PJ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((team, index) => (
                <TableRow key={team.team_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell align="right">{team.clean_sheets}</TableCell>
                  <TableCell align="right">{team.played}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
