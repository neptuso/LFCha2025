import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import StandingsTableExtended from '../components/StandingsTableExtended';
import Fixture from '../components/Fixture';

//const API_BASE = 'http://localhost:8000';
import { API_BASE } from '../services/api';

export default function TournamentDashboard() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/standings-extended/1`);
        setStandings(response.data);
      } catch (err) {
        setError('No se pudo cargar la tabla de posiciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Torneo Clausura 2025
      </Typography>
      <Grid container spacing={3}>
        {/* Columna Izquierda: Fixture (Placeholder) */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ height: '100%' }}>
            <Fixture />
          </Paper>
        </Grid>

        {/* Columna Derecha: Tabla de Posiciones */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tabla de Posiciones
            </Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
              <StandingsTableExtended standings={standings} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}