import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { fetchCalendarMatches, fetchMatches } from '../services/api';
import { getTeamDisplay } from '../utils/teamDisplay';

export default function AlmanacView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysWithMatches, setDaysWithMatches] = useState([]);
  const [matchesForDay, setMatchesForDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Carga los días que tienen partidos para el mes actual
  useEffect(() => {
    const loadMonthData = async () => {
      try {
        setLoading(true);
        setError(null);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // API usa mes 1-12
        const days = await fetchCalendarMatches(year, month);
        setDaysWithMatches(days);
      } catch (err) {
        console.error("Error al cargar el calendario", err);
        setError("No se pudo cargar el calendario del mes.");
      } finally {
        setLoading(false);
      }
    };
    loadMonthData();
  }, [currentDate]);

  // Carga los partidos para el día seleccionado
  const handleDayClick = useCallback(async (dateStr) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    try {
      setLoading(true);
      const matches = await fetchMatches({ date: dateStr });
      setMatchesForDay(matches);
    } catch (err) {
      console.error(`Error al cargar partidos para ${dateStr}`, err);
      setError(`No se pudieron cargar los partidos.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateMonth = (direction) => {
    setSelectedDate(null); // Limpiar selección al cambiar de mes
    setMatchesForDay([]);
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const days = [];
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, hasMatches: daysWithMatches.includes(i) });
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>📅 Almanaque de Partidos</Typography>

      {selectedDate ? (
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedDate(null)} sx={{ mb: 2 }}>
            Volver al almanaque
          </Button>
          <Typography variant="h5" gutterBottom>
            Partidos del {new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('es-ES', { dateStyle: 'full', timeZone: 'UTC' })}
          </Typography>
          {loading ? <CircularProgress /> : (
            <Grid container spacing={2}>
              {matchesForDay.length > 0 ? matchesForDay.map((match) => {
                const homeDisplay = getTeamDisplay(match.home_team.name);
                const awayDisplay = getTeamDisplay(match.away_team.name);
                return (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <Paper component={Link} to={`/match/${match.id}`} sx={{ p: 2, textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <Typography variant="body2" color="textSecondary">{match.round}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {homeDisplay.abbr} vs {awayDisplay.abbr}
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ my: 1 }}>
                        {match.home_score ?? '?'} - {match.away_score ?? '?'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">{match.facility}</Typography>
                    </Paper>
                  </Grid>
                );
              }) : <Typography sx={{m: 2}}>No hay partidos programados para esta fecha.</Typography>}
            </Grid>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <IconButton onClick={() => navigateMonth(-1)}><ArrowBackIcon /></IconButton>
            <Typography variant="h5">{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</Typography>
            <IconButton onClick={() => navigateMonth(1)}><ArrowForwardIcon /></IconButton>
          </Box>
          {loading ? <CircularProgress /> : (
            <Grid container spacing={1}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <Grid item xs={1.714} key={day} sx={{ textAlign: 'center', fontWeight: 'bold' }}>{day}</Grid>
              ))}
              {days.map((day, index) => (
                <Grid item xs={1.714} key={index}>
                  {day ? (
                    <Paper 
                      sx={{ p: 1, textAlign: 'center', minHeight: '60px', cursor: day.hasMatches ? 'pointer' : 'default', backgroundColor: day.hasMatches ? 'primary.light' : 'background.default', '&:hover': { backgroundColor: day.hasMatches ? 'primary.main' : ''} }}
                      onClick={() => day.hasMatches && handleDayClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`)}
                    >
                      <Typography variant="body2">{day.day}</Typography>
                      {day.hasMatches && <Chip size="small" label="•" color="secondary" sx={{ mt: 0.5 }}/>}
                    </Paper>
                  ) : <Paper sx={{ p: 1, minHeight: '60px', backgroundColor: '#222' }} />}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}
