import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/match-detail/${id}`);
        setMatch(response.data.match);
        setEvents(response.data.events);
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

  return (
    <Box sx={{ padding: 3 }}>
      <Link to="/calendar" style={{ textDecoration: 'none' }}>
        ← Volver al calendario
      </Link>
      <Typography variant="h4" gutterBottom>
        {match.home_team} vs {match.away_team}
      </Typography>
      <Typography variant="h6" color="textSecondary">
        {match.date ? new Date(match.date).toLocaleDateString('es-ES') : 'Sin fecha'} | {match.facility}
      </Typography>
      <Typography variant="h5" sx={{ my: 2 }}>
        {match.home_score} - {match.away_score}
      </Typography>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>📋 Eventos del partido</Typography>
      <List>
        {events.length === 0 ? (
          <ListItem>
            <ListItemText primary="No hay eventos registrados" />
          </ListItem>
        ) : (
          events.map((event, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={`${event.minute}' ${event.type}`}
                  secondary={`${event.player} (${event.team}) ${event.sub_type ? `(${event.sub_type})` : ''}`}
                />
              </ListItem>
              <Divider />
            </div>
          ))
        )}
      </List>
    </Box>
  );
}