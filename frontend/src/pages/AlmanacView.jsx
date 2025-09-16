import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

const API_BASE = 'https://lfcha2025.onrender.com';
//const API_BASE = 'http://localhost:8000';

export default function AlmanacView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matchesByDate, setMatchesByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/matches`);
        const grouped = response.data.reduce((acc, match) => {
          if (!match.date) return acc;
          const dateStr = match.date.split('T')[0]; // YYYY-MM-DD, directamente del string UTC
          if (!acc[dateStr]) acc[dateStr] = [];
          acc[dateStr].push(match);
          return acc;
        }, {});
        setMatchesByDate(grouped);
      } catch (err) {
        console.error("Error al cargar almanaque", err);
        setError("No se pudo cargar el almanaque");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (dateStr) => {
    // Añadimos T12:00:00 para evitar que el cambio de zona horaria nos mueva al día anterior
    const date = new Date(`${dateStr}T12:00:00Z`);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Forzar la interpretación como UTC
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const startDay = firstDay.getDay(); // 0 = Sunday
    
    // Dias vacíos del mes anterior
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Dias del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(Date.UTC(year, month, i)).toISOString().split('T')[0];
      days.push({
        day: i,
        dateStr: dateStr,
        hasMatches: !!matchesByDate[dateStr]
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

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
        📅 Almanaque de Partidos
      </Typography>

      {selectedDate ? (
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setSelectedDate(null)}
            sx={{ mb: 2 }}
          >
            Volver al almanaque
          </Button>
          <Typography variant="h5" gutterBottom>
            Partidos del {formatDate(selectedDate)}
          </Typography>
          
          {matchesByDate[selectedDate] && matchesByDate[selectedDate].length > 0 ? (
            <Grid container spacing={2}>
              {matchesByDate[selectedDate].map((match) => (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Link to={`/match/${match.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {match.home_team.name} vs {match.away_team.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {match.facility}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {match.round ? `Ronda: ${match.round}` : ''}
                      </Typography>
                      {(match.home_score !== null || match.away_score !== null) && (
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          {match.home_score ?? '?'} - {match.away_score ?? '?'}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, borderTop: '1px solid #eee', pt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Eventos: {match.home_team_events}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Eventos: {match.away_team_events}
                        </Typography>
                      </Box>
                    </Link>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No hay partidos programados para esta fecha</Typography>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <IconButton onClick={() => navigateMonth(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton onClick={() => navigateMonth(1)}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>

          <Grid container spacing={1}>
            {/* Encabezados de días */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <Grid item xs={1.714} key={day} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {day}
              </Grid>
            ))}

            {/* Días del mes */}
            {days.map((day, index) => (
              <Grid item xs={1.714} key={index}>
                {day ? (
                  <Paper 
                    sx={{ 
                      p: 1, 
                      textAlign: 'center',
                      minHeight: '60px',
                      cursor: 'pointer',
                      backgroundColor: day.hasMatches ? 'primary.light' : 'background.default',
                      '&:hover': {
                        backgroundColor: day.hasMatches ? 'primary.main' : 'action.hover',
                        opacity: 0.8
                      }
                    }}
                    onClick={() => setSelectedDate(day.dateStr)}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: day.hasMatches ? 'bold' : 'normal',
                        color: day.hasMatches ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      {day.day}
                    </Typography>
                    {day.hasMatches && (
                      <Chip 
                        size="small" 
                        label="•" 
                        color="primary" 
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Paper>
                ) : (
                  <Paper sx={{ p: 1, textAlign: 'center', minHeight: '60px' }} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}