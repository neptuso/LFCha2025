import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/match-detail/${id}`);
        setMatch(response.data);
      } catch (error) {
        console.error("Error al cargar el detalle", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Cargando detalle del partido...</div>;
  if (!match) return <div>Partido no encontrado</div>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        {match.match.home_team} {match.match.home_score} - {match.match.away_score} {match.match.away_team}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        {new Date(match.match.date).toLocaleString()} | Ronda {match.match.round} | {match.match.facility}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Línea de tiempo</Typography>
      <List>
        {match.events.map((event, index) => (
          <ListItem key={index} divider>
            <Chip
              label={`${event.minute}' ${event.phase}`}
              color={event.is_home ? "primary" : "default"}
              size="small"
              sx={{ mr: 2 }}
            />
            <ListItemText
              primary={`${event.type}${event.sub_type ? ` (${event.sub_type})` : ''}`}
              secondary={`${event.player} - ${event.team}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}