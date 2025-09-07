import React from 'react';
import { Box, Typography, Grid, Paper, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function StatsDashboard() {
  const stats = [
    { title: "Goles por Minuto", description: "Distribución de goles durante el partido", path: "/stats/goals-by-minute", color: "primary" },
    { title: "Goleadores por Equipo", description: "Máximos anotadores de cada club", path: "/stats/top-scorers-by-team", color: "success" },
    { title: "Tarjetas por Equipo", description: "Total de amarillas y rojas", path: "/stats/cards-by-team", color: "warning" },
    { title: "Rachas de Partidos", description: "Equipos en racha ganadora o invictos", path: "/stats/streaks", color: "error" }
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>📊 Estadísticas Avanzadas</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Profundiza el análisis del torneo con estadísticas detalladas
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper 
              component={Link} 
              to={stat.path} 
              components={RouterLink}
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
                bgcolor: `${stat.color}.light`,
                '&:hover': {
                  bgcolor: `${stat.color}.main`,
                  color: 'white'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {stat.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {stat.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}