import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import TopStandingsWidget from '../components/widgets/TopStandingsWidget';
import { fetchDashboardData } from '../services/api';

// Placeholder para widgets que aún no hemos creado
const WidgetPlaceholder = ({ title, height = 200 }) => (
  <Paper sx={{ p: 2, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#272727' }}>
    <Typography color="text.secondary">{title} (Próximamente)</Typography>
  </Paper>
);

export default function HomeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Error al cargar el dashboard", err);
        setError("No se pudo cargar la información del dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard Principal
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <WidgetPlaceholder title="Resultados de la Última Jornada" height={250} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopStandingsWidget 
            standings={dashboardData?.top_5_standings}
            loading={loading}
            error={null} // El error principal se maneja arriba
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <WidgetPlaceholder title="Goleadores" />
        </Grid>
        <Grid item xs={12} md={8}>
          <WidgetPlaceholder title="Próximos Partidos Clave" />
        </Grid>
      </Grid>
    </Box>
  );
}
