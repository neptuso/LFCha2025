import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Link,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';
//const API_BASE = 'http://localhost:8000';

export default function CalendarView() {
  const [matchesByMonth, setMatchesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cachedData, setCachedData] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (cachedData) {
        setMatchesByMonth(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/matches`);
        
        // ✅ 1. Ordenar partidos por fecha DESC (más reciente primero)
        const sortedMatches = [...response.data].sort((a, b) => new Date(b.date) - new Date(a.date));

        // ✅ 2. Agrupar por mes/año y ordenar meses DESC
        const grouped = sortedMatches.reduce((acc, match) => {
          if (!match.date) return acc;
          const date = new Date(match.date);
          // Formato: "marzo 2025"
          const monthYear = date.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
          }).toUpperCase();

          if (!acc[monthYear]) acc[monthYear] = [];
          acc[monthYear].push(match);
          return acc;
        }, {});

        // ✅ 3. Ordenar meses por fecha (más reciente primero)
        const sortedMonths = Object.keys(grouped).sort((a, b) => {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const indexA = months.indexOf(monthA.toLowerCase());
          const indexB = months.indexOf(monthB.toLowerCase());
          return new Date(yearB, indexB) - new Date(yearA, indexA);
        });

        // ✅ 4. Reconstruir objeto con meses ordenados
        const orderedGrouped = {};
        sortedMonths.forEach(month => {
          orderedGrouped[month] = grouped[month];
        });

        setCachedData(orderedGrouped);
        setMatchesByMonth(orderedGrouped);
      } catch (err) {
        console.error("Error al cargar calendario", err);
        setError("No se pudo cargar el calendario. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cachedData]);

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

  const months = Object.keys(matchesByMonth);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        📅 Calendario Mensual
      </Typography>

      {months.length === 0 ? (
        <Typography>No hay partidos programados.</Typography>
      ) : (
        months.map((monthYear) => (
          <Accordion key={monthYear} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {/* Capitaliza solo la primera letra del mes */}
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1).toLowerCase()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {matchesByMonth[monthYear].map((match) => {
                if (!match || !match.id) return null;

                const dateObj = new Date(match.date);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                });
                const timeString = dateObj.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <React.Fragment key={match.id}>
                    <ListItem
                      component={Link}
                      to={`/match/${match.id}`}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'action.hover',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {match.home_team.name} vs {match.away_team.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {formattedDate} - {timeString}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="textSecondary">
                              {match.facility} | {match.status} | Ronda: {match.round || 'N/A'}
                            </Typography>
                            {(match.home_score !== null || match.away_score !== null) && (
                              <>
                                <br />
                                <Typography component="span" variant="body2" color="primary">
                                  Resultado: {match.home_score ?? '?'} - {match.away_score ?? '?'}
                                </Typography>
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}