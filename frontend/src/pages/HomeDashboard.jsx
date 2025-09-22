import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import TopStandingsWidget from '../components/widgets/TopStandingsWidget'; // Importar el widget real

// --- Placeholder para Widgets --- //
// En los siguientes pasos, reemplazaremos estos placeholders con componentes reales.

const WidgetPlaceholder = ({ title, height = 200 }) => (
  <Paper sx={{ p: 2, height: height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#272727' }}>
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="body2" color="text.secondary">(Contenido Próximamente)</Typography>
  </Paper>
);

// --- Componente Principal del Dashboard --- //

export default function HomeDashboard() {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard Principal
      </Typography>

      <Grid container spacing={3}>
        {/* Fila 1: Resultados y Posiciones */}
        <Grid item xs={12} md={8}>
          <WidgetPlaceholder title="Resultados de la Última Jornada" height={250} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopStandingsWidget />
        </Grid>

        {/* Fila 2: Goleadores y Próximos Partidos */}
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
