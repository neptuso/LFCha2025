// frontend/src/pages/Matches.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/matches`);
        setMatches(response.data);
      } catch (error) {
        console.error("Error al cargar partidos", error);
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Calendario de Partidos</Typography>
      <Grid container spacing={3}>
        {matches.map(match => (
          <Grid item xs={12} sm={6} md={4} key={match.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  {new Date(match.date).toLocaleDateString()}
                </Typography>
                <Box sx={{ my: 2, textAlign: 'center' }}>
                  <Typography>{match.home_team.name}</Typography>
                  <Typography variant="h5">
                    {match.home_score ?? '-'} - {match.away_score ?? '-'}
                  </Typography>
                  <Typography>{match.away_team.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ronda: {match.round} | {match.facility}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}