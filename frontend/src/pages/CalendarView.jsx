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
  CircularProgress,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export default function CalendarView() {
  const [matchesByMonth, setMatchesByMonth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/matches`);
        const grouped = response.data.reduce((acc, match) => {
          if (!match.date) return acc;
          const date = new Date(match.date);
          const month = date.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
          });
          if (!acc[month]) acc[month] = [];
          acc[month].push(match);
          return acc;
        }, {});
        setMatchesByMonth(grouped);
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
      <Typography variant="h4" gutterBottom>📅 Calendario Mensual</Typography>
      {Object.keys(matchesByMonth).length === 0 ? (
        <Typography>No hay partidos programados</Typography>
      ) : (
        Object.keys(matchesByMonth).map(month => (
          <Accordion key={month}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" textTransform="capitalize">{month}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {matchesByMonth[month].map(match => {
                const date = new Date(match.date);
                return (
                  <div key={match.id}>
                    <ListItem
                      button
                      component={Link}
                      to={`/match/${match.id}`}
                      sx={{ borderRadius: 1, mb: 1, bgcolor: 'action.hover' }}
                    >
                      <ListItemText
                        primary={`${match.home_team.name} ${match.home_score ?? '-'} - ${match.away_score ?? '-'} ${match.away_team.name}`}
                        secondary={`${date.toLocaleDateString('es-ES')} | ${match.facility} | ${match.status}`}
                      />
                    </ListItem>
                    <Divider />
                  </div>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}