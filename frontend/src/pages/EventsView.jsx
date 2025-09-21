import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';

//const API_BASE = 'http://localhost:8000';
import { API_BASE } from '../services/api';

export default function EventsView() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/matches-with-stats`);
        setMatches(response.data);
      } catch (err) {
        console.error("Error al cargar partidos con estadísticas", err);
        setError("No se pudo cargar la información de los partidos.");
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        📦 Partidos por Eventos
      </Typography>
      
      <Grid container spacing={2}>
        {matches.map((match) => (
          <Grid item xs={12} sm={6} md={4} key={match.id}>
            <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
              <Link to={`/match/${match.match_id_comet}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {match.home_team.name} vs {match.away_team.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(match.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {match.facility}
                </Typography>
                
                {/* Scores */}
                {(match.home_score !== null || match.away_score !== null) && (
                  <Typography variant="h5" color="primary" sx={{ my: 1, fontWeight: 'bold' }}>
                    {match.home_score ?? '?'} - {match.away_score ?? '?'}
                  </Typography>
                )}

                {/* Event Counts */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 1 }}>
                   <Chip
                      icon={<EventIcon />}
                      label={match.home_event_count}
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: 'grey.400' }}
                    />
                    <Typography variant="caption" color="textSecondary">Eventos</Typography>
                   <Chip
                      icon={<EventIcon />}
                      label={match.away_event_count}
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: 'grey.400' }}
                    />
                </Box>
              </Link>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
