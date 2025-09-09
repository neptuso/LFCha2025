import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

// Helper for user-friendly event names
const eventTypeNames = {
  'Goal': 'Goles',
  'Yellow Card': 'Tarjetas Amarillas',
  'Red Card': 'Tarjetas Rojas',
  'Substitution': 'Sustituciones',
  'Penalty': 'Penales',
};

const getEventName = (type) => eventTypeNames[type] || type;

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [groupedEvents, setGroupedEvents] = useState({ home: {}, away: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/match-detail/${id}`);
        const matchData = response.data.match;
        const eventsData = response.data.events;

        setMatch(matchData);

        // Process and group events
        const groups = { home: {}, away: {} };
        for (const event of eventsData) {
          const teamKey = event.is_home ? 'home' : 'away';
          const eventType = event.type;

          if (!groups[teamKey][eventType]) {
            groups[teamKey][eventType] = {
              count: 0,
              events: [],
            };
          }
          groups[teamKey][eventType].count += 1;
          groups[teamKey][eventType].events.push(event);
        }
        setGroupedEvents(groups);

      } catch (error) {
        console.error("Error al cargar detalle del partido", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;

  if (!match) return <Typography>Partido no encontrado</Typography>;

  const renderEventGroup = (teamEvents) => {
    if (Object.keys(teamEvents).length === 0) {
      return <Typography sx={{mt: 2}}>No hay eventos registrados para este equipo.</Typography>;
    }
    return Object.entries(teamEvents)
      .sort(([typeA], [typeB]) => getEventName(typeA).localeCompare(getEventName(typeB)))
      .map(([type, data]) => (
        <Accordion key={type} sx={{ my: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>{`${getEventName(type)} (${data.count})`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List dense sx={{ width: '100%' }}>
              {data.events.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${event.minute}' - ${event.player}`}
                      secondary={event.sub_type ? `Detalle: ${event.sub_type}` : null}
                    />
                  </ListItem>
                  {index < data.events.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        {match.home_team} vs {match.away_team}
      </Typography>
      <Typography variant="h5" color="primary" align="center" sx={{ my: 1, fontWeight: 'bold' }}>
        {match.home_score} - {match.away_score}
      </Typography>
      <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
        {match.date ? new Date(match.date).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' }) : 'Sin fecha'} | {match.facility}
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Local: {match.home_team}
          </Typography>
          {renderEventGroup(groupedEvents.home)}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            Visitante: {match.away_team}
          </Typography>
          {renderEventGroup(groupedEvents.away)}
        </Grid>
      </Grid>
    </Box>
  );
}
