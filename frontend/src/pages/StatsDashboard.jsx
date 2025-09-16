import React from 'react';
import { Box, Typography, Grid, Paper, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function StatsDashboard() {
  const stats = [
    { title: "Tabla de Posiciones", description: "Clasificación actual del torneo", path: "/", color: "primary" },
    { title: "Goleadores", description: "Máximos anotadores del torneo", path: "/top-scorers", color: "success" },
    { title: "Almanaque", description: "Resultados y partidos por fecha", path: "/almanac", color: "info" },
    { title: "Calendario", description: "Próximos partidos del torneo", path: "/calendar", color: "secondary" },
    { title: "Tarjetas por Equipo", description: "Total de amarillas y rojas", path: "/stats/cards-by-team", color: "warning" },
    { title: "Rachas de Partidos", description: "Equipos en racha ganadora o invictos", path: "/stats/streaks", color: "error" },
    { title: "Goles por Minuto", description: "Distribución de goles en el partido", path: "/stats/goals-by-minute", color: "primary" },
    { title: "Goleadores por Equipo", description: "Máximos anotadores de cada club", path: "/stats/top-scorers-by-team", color: "success" },
    { title: "Sanciones por Jugador", description: "Ranking de tarjetas por jugador", path: "/stats/player-sanctions", color: "secondary" }
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>📊 Dashboard de Estadísticas</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Selecciona una categoría para explorar los datos del torneo
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper 
              component={RouterLink} 
              to={stat.path} 
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