import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Avatar,
  Button,
  IconButton
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StyleIcon from '@mui/icons-material/Style';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { getTeamDisplay } from '../utils/teamDisplay';

// --- SUB-COMPONENTES DE DISEÑO ---

const MatchHeader = ({ match }) => {
  const homeDisplay = getTeamDisplay(match.home_team);
  const awayDisplay = getTeamDisplay(match.away_team);
  const matchDate = new Date(match.date).toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'center' }}>
      <Grid container alignItems="center" justifyContent="space-around">
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={homeDisplay.shield} alt={match.home_team} sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="h6" align="center">{homeDisplay.abbr}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h2" fontWeight="bold">{`${match.home_score ?? '?'} - ${match.away_score ?? '?'}`}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">{match.status}</Typography>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={awayDisplay.shield} alt={match.away_team} sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="h6" align="center">{awayDisplay.abbr}</Typography>
        </Grid>
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {matchDate}
      </Typography>
    </Paper>
  );
};

const EventList = ({ events, homeTeamName, awayTeamName }) => {
    const keyEvents = events
        .filter(e => e.type === 'Goal' || e.type === 'Own goal' || e.type === 'Penalty' || e.type === 'Yellow card' || e.type === 'Red card' || e.type === 'Substitution')
        .sort((a, b) => a.minute - b.minute);

    const homeEvents = keyEvents.filter(e => e.is_home);
    const awayEvents = keyEvents.filter(e => !e.is_home);

    const getIcon = (event) => {
        if (['Goal', 'Own goal', 'Penalty'].includes(event.type)) return <SportsSoccerIcon sx={{ color: 'success.main' }} />;
        if (event.type === 'Yellow card') return <StyleIcon sx={{ color: '#ffc107' }} />;
        if (event.type === 'Red card') return <StyleIcon sx={{ color: 'error.main' }} />;
        if (event.type === 'Substitution') return <SwapHorizIcon sx={{ color: 'info.main' }} />;
        return null;
    };

    const renderEvent = (event, index) => (
        <ListItem key={index}>
            <ListItemIcon sx={{ minWidth: 36 }}>{getIcon(event)}</ListItemIcon>
            <ListItemText 
                primary={`${event.minute}' ${event.player}`}
                secondary={event.type === 'Substitution' ? `Sale ${event.player_out_name}` : event.sub_type}
            />
        </ListItem>
    );

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Eventos del Partido</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">{homeTeamName}</Typography>
                    <List dense>{homeEvents.map(renderEvent)}</List>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">{awayTeamName}</Typography>
                    <List dense>{awayEvents.map(renderEvent)}</List>
                </Grid>
            </Grid>
        </Paper>
    );
}

// --- COMPONENTE PRINCIPAL ---

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (!match) return <Typography sx={{ textAlign: 'center', mt: 5 }}>Partido no encontrado</Typography>;

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>
      <MatchHeader match={match} />
      <EventList events={events} homeTeamName={match.home_team} awayTeamName={match.away_team} />
    </Container>
  );
}
