
import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Alert,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import axios from 'axios';
import { format } from 'date-fns';

//const API_BASE = 'http://localhost:8000';
import { API_BASE } from '../services/api';

export default function PlayerGoals() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar datos del jugador y sus goles en paralelo
        const playerPromise = axios.get(`${API_BASE}/api/player/${playerId}`);
        const goalsPromise = axios.get(`${API_BASE}/api/player/${playerId}/goals`);

        const [playerResponse, goalsResponse] = await Promise.all([playerPromise, goalsPromise]);

        setPlayer(playerResponse.data);
        setGoals(goalsResponse.data);

      } catch (err) {
        console.error("Error al cargar los datos del jugador", err);
        setError("No se pudieron cargar los datos del jugador.");
      } finally {
        setLoading(false);
      }
    };

    loadPlayerData();
  }, [playerId]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!player) return <Typography sx={{ textAlign: 'center', mt: 5 }}>Jugador no encontrado</Typography>;

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>Goles de {player.name}</Typography>
        <Typography variant="h6" color="text.secondary">Total: {goals.length} goles</Typography>
      </Paper>

      <List>
        {goals.map((goal, index) => (
          <Paper key={index} sx={{ mb: 2, borderRadius: 2 }} elevation={1}>
            <ListItem>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{format(new Date(goal.match_date), 'dd/MM/yyyy')}</Typography>
                    <Typography variant="h6">{goal.minute}'</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Avatar src={goal.team_shield_url} sx={{ width: 32, height: 32, mr: 1 }} />
                        <Typography variant="body1">vs</Typography>
                        <Avatar src={goal.opponent_shield_url} sx={{ width: 32, height: 32, ml: 1 }} />
                        <Typography variant="body1" sx={{ ml: 2 }}>{goal.opponent_name}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                        <SportsSoccerIcon color="success" />
                    </ListItemIcon>
                    <ListItemText secondary={goal.event_type} sx={{textAlign: 'center'}} />
                </Grid>
              </Grid>
            </ListItem>
          </Paper>
        ))}
      </List>
    </Container>
  );
}
