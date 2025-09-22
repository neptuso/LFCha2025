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
import { Link as RouterLink } from 'react-router-dom';
import { fetchCalendarView } from '../services/api';

export default function CalendarView() {
  const [matchesByMonth, setMatchesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCalendarView();
        setMatchesByMonth(data);
      } catch (err) {
        console.error("Error al cargar calendario", err);
        setError("No se pudo cargar el calendario. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    load();
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
          <Accordion key={monthYear} defaultExpanded={months.indexOf(monthYear) === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1).toLowerCase()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <List disablePadding>
                {matchesByMonth[monthYear].map((match) => {
                  const dateObj = new Date(match.date);
                  const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                  const timeString = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <React.Fragment key={match.id}>
                      <ListItem
                        button
                        component={RouterLink}
                        to={`/match/${match.id}`}
                        sx={{ borderRadius: 2, mb: 1, bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
                      >
                        <ListItemText
                          primary={`${match.home_team_name} vs ${match.away_team_name}`}
                          secondary={`${formattedDate} - ${timeString} | ${match.facility}`}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {match.home_score ?? '-'} - {match.away_score ?? '-'}
                        </Typography>
                      </ListItem>
                      <Divider component="li" variant="inset" />
                    </React.Fragment>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
