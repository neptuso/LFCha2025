
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import StyleIcon from '@mui/icons-material/Style'; // Icono para Tarjetas
import axios from 'axios';
import { format } from 'date-fns';

//const API_BASE = 'http://localhost:8000';
import { API_BASE } from '../services/api';

const CardIcon = ({ eventType }) => {
    const color = eventType === 'Yellow card' ? '#ffc107' : 'error.main';
    return <StyleIcon sx={{ color }} />;
};

export default function PlayerSanctionsDetail() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        const playerPromise = axios.get(`${API_BASE}/api/player/${playerId}`);
        const sanctionsPromise = axios.get(`${API_BASE}/api/player/${playerId}/sanctions`);

        const [playerResponse, sanctionsResponse] = await Promise.all([playerPromise, sanctionsPromise]);

        setPlayer(playerResponse.data);
        setSanctions(sanctionsResponse.data);

      } catch (err) {
        console.error("Error al cargar los datos de sanciones del jugador", err);
        setError("No se pudieron cargar los datos de sanciones del jugador.");
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
        <Typography variant="h4" gutterBottom>Sanciones de {player.name}</Typography>
        <Typography variant="h6" color="text.secondary">Total: {sanctions.length} tarjetas</Typography>
      </Paper>

      <List>
        {sanctions.map((sanction, index) => (
          <Paper key={index} sx={{ mb: 2, borderRadius: 2 }} elevation={1}>
            <ListItem>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{format(new Date(sanction.match_date), 'dd/MM/yyyy')}</Typography>
                    <Typography variant="h6">{sanction.minute}'</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Avatar src={sanction.team_shield_url} sx={{ width: 32, height: 32, mr: 1 }} />
                        <Typography variant="body1">vs</Typography>
                        <Avatar src={sanction.opponent_shield_url} sx={{ width: 32, height: 32, ml: 1 }} />
                        <Typography variant="body1" sx={{ ml: 2 }}>{sanction.opponent_name}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                        <CardIcon eventType={sanction.event_type} />
                    </ListItemIcon>
                    <ListItemText secondary={sanction.sub_type || sanction.event_type} sx={{textAlign: 'center'}} />
                </Grid>
              </Grid>
            </ListItem>
          </Paper>
        ))}
      </List>
    </Container>
  );
}
