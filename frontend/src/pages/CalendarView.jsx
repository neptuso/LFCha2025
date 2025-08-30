// frontend/src/pages/CalendarView.jsx

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
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export default function CalendarView() {
  const [matchesByDate, setMatchesByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/matches`);
        const grouped = response.data.reduce((acc, match) => {
          const date = match.date ? new Date(match.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "Sin fecha";
          if (!acc[date]) acc[date] = [];
          acc[date].push(match);
          return acc;
        }, {});
        setMatchesByDate(grouped);
      } catch (error) {
        console.error("Error al cargar calendario", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>📅 Calendario de Partidos</Typography>
      {Object.keys(matchesByDate).length === 0 ? (
        <Typography>No hay partidos programados</Typography>
      ) : (
        Object.keys(matchesByDate).map(date => (
          <Accordion key={date}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{date}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {matchesByDate[date].map(match => (
                  <ListItem
                    button
                    key={match.id}
                    component={Link}
                    to={`/match/${match.id}`}
                    sx={{ borderRadius: 1, mb: 1, bgcolor: 'action.hover' }}
                  >
                    <ListItemText
                      primary={`${match.home_team.name} ${match.home_score ?? '-'} - ${match.away_score ?? '-'} ${match.away_team.name}`}
                      secondary={`Ronda ${match.round} | ${match.facility} | ${match.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}