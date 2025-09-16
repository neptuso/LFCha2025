import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Avatar
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'; // Icono para Gol
import StyleIcon from '@mui/icons-material/Style'; // Icono para Tarjetas
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'; // Icono para Sustitución
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

// Este mapa de escudos ahora se obtiene de la DB, pero lo mantenemos como fallback
const getShieldUrl = (teamName) => {
  const shields = {
    'TIRO FEDERAL (CHAJARI)': '/shields/tiro_federal.png',
    'LA FLORIDA (CHAJARI)': '/shields/la_florida.png',
    'VELEZ SARSFIELD (CHAJARI)': '/shields/velez.png',
    'CHACARITA (CHAJARI)': '/shields/chacarita.png',
    'MOCORETA': '/shields/mocoreta.png',
    'SAN JOSE OBRERO': '/shields/san_jose_obrero.png',
    'SAN FRANCISCO (CHAJARI)': '/shields/san_francisco.png',
    'INDEPENDIENTE (CHAJARI)': '/shields/independiente.png',
    '1° DE MAYO (CHAJARI)': '/shields/prim_mayo.png',
    'SANTA ROSA (CHAJARI)': '/shields/santa_rosa.png',
    'FERROCARRIL': '/shields/ferrocarril.png',
    'SANTA ANA': '/shields/santa_ana.png',
    'SAN CLEMENTE (CHAJARI)': '/shields/san_clemente.png',
    'LOS CONQUISTADORES': '/shields/default.png'
  };
  return shields[teamName] || '/shields/default.png';
};

// --- SUB-COMPONENTES DE DISEÑO ---

const MatchHeader = ({ match }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
    <Grid container alignItems="center" justifyContent="space-around">
      <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={getShieldUrl(match.home_team)} alt={match.home_team} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="h6" align="center">{match.home_team}</Typography>
      </Grid>
      <Grid item xs={4} sx={{ textAlign: 'center' }}>
        <Typography variant="h2" fontWeight="bold">{`${match.home_score ?? '?'} - ${match.away_score ?? '?'}`}</Typography>
        <Typography variant="caption" color="text.secondary">{match.status}</Typography>
      </Grid>
      <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={getShieldUrl(match.away_team)} alt={match.away_team} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="h6" align="center">{match.away_team}</Typography>
      </Grid>
    </Grid>
  </Paper>
);

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
                secondary={event.type === 'Substitution' ? `Entra por ${event.second_player_id}` : event.sub_type}
            />
        </ListItem>
    );

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Eventos del Partido</Typography>
            <Grid container spacing={2}>
                {/* Columna Local */}
                <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">{homeTeamName}</Typography>
                    <List dense>{homeEvents.map(renderEvent)}</List>
                </Grid>
                {/* Columna Visitante */}
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
      <MatchHeader match={match} />
      <EventList events={events} homeTeamName={match.home_team} awayTeamName={match.away_team} />
    </Container>
  );
}