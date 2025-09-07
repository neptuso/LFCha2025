import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';
//const API_BASE = 'http://localhost:8000';

export default function StreaksView() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/stats/streaks?competition_id=1`);
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar rachas", err);
        setError("No se pudieron cargar las rachas de partidos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const teams = Object.keys(data);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Rachas de Partidos</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Equipos en racha ganadora o invictos
      </Typography>

      <Grid container spacing={2}>
        {teams.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No hay datos disponibles</Typography>
          </Grid>
        ) : (
          teams.map((teamName) => {
            const streaks = data[teamName];
            if ((streaks.ganando || 0) < 2 && (streaks.invicto || 0) < 3) return null;

            return (
              <Grid item xs={12} sm={6} md={4} key={teamName}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {teamName}
                  </Typography>
                  {streaks.ganando > 1 && (
                    <Chip 
                      label={`Ganando ${streaks.ganando} partidos`} 
                      color="success" 
                      size="small" 
                      sx={{ mt: 1, mr: 1 }}
                    />
                  )}
                  {streaks.invicto > 2 && (
                    <Chip 
                      label={`Invicto ${streaks.invicto} partidos`} 
                      color="primary" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}