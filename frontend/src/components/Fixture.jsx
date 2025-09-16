import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Tabs, Tab, Paper, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

const getShieldUrl = (teamName) => {
  const shields = {
    'TIRO FEDERAL (CHAJARI)': '/shields/tiro_federal.png',
    'LA FLORIDA (CHAJARI)': '/shields/la_florida.png',
    'VELEZ SARSFIELD (CHAJARI)': '/shields/velez.png',
    'CHACARITA (CHAJARI)': '/shields/chacarita.png',
    'MOCORETA': '/shields/mocoreta.png',
    'SAN JOSE OBRERO': '/shields/san_jose.png',
    'SAN FRANCISCO (CHAJARI)': '/shields/san_francisco.png',
    'INDEPENDIENTE (CHAJARI)': '/shields/independiente.png',
    '1° DE MAYO (CHAJARI)': '/shields/primero_de_mayo.png',
    'SANTA ROSA (CHAJARI)': '/shields/santa_rosa.png',
    'FERROCARRIL': '/shields/ferrocarril.png',
    'SANTA ANA': '/shields/santa_ana.png',
    'SAN CLEMENTE (CHAJARI)': '/shields/san_clemente.png',
    'LOS CONQUISTADORES': '/shields/los_conquistadores.png'
  };
  return shields[teamName] || '/shields/default.png';
};

const MatchRow = ({ match }) => (
  <Box sx={{ my: 2, p: 1.5, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}>
    <Grid container alignItems="center" justifyContent="space-between">
      {/* Equipos y Resultado */}
      <Grid item xs={10} container alignItems="center" component={RouterLink} to={`/match/${match.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
        <Grid item xs={5} container alignItems="center" justifyContent="flex-end">
          <Typography align="right" sx={{ mr: 1 }}>{match.home_team.name}</Typography>
          <img src={getShieldUrl(match.home_team.name)} alt={match.home_team.name} style={{ width: 24, height: 24 }} />
        </Grid>
        
        <Grid item xs={2} align="center">
          <Typography variant="h6" component="span" sx={{ px: 1, backgroundColor: 'background.paper', borderRadius: 1 }}>
            {match.home_score ?? '-'} - {match.away_score ?? '-'}
          </Typography>
        </Grid>

        <Grid item xs={5} container alignItems="center">
          <img src={getShieldUrl(match.away_team.name)} alt={match.away_team.name} style={{ width: 24, height: 24, marginRight: 8 }} />
          <Typography>{match.away_team.name}</Typography>
        </Grid>
      </Grid>

      {/* Info extra */}
      <Grid item xs={2} align="center">
         <Typography variant="caption" display="block">{new Date(match.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</Typography>
         <Typography variant="caption" color="text.secondary">{match.facility}</Typography>
      </Grid>
    </Grid>
  </Box>
);

export default function Fixture() {
  const [matchesByRound, setMatchesByRound] = useState({});
  const [sortedRounds, setSortedRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/matches`);
        
        if (!response.data || response.data.length === 0) {
            setMatchesByRound({});
            setSortedRounds([]);
            return;
        }

        const grouped = response.data.reduce((acc, match) => {
          const round = match.round || 'N/A';
          if (!acc[round]) acc[round] = [];
          acc[round].push(match);
          return acc;
        }, {});

        const rounds = Object.keys(grouped).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/));
            const numB = parseInt(b.match(/\d+/));
            if (numA && numB) return numA - numB;
            return a.localeCompare(b);
        });

        setMatchesByRound(grouped);
        setSortedRounds(rounds);
        if (rounds.length > 0) {
          setSelectedRound(rounds[0]);
        }

      } catch (err) {
        setError('No se pudo cargar el fixture.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedRound(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Fixture</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedRound}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="fixture rounds"
        >
          {sortedRounds.map(round => (
            <Tab label={round} value={round} key={round} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {selectedRound && matchesByRound[selectedRound] ? (
          matchesByRound[selectedRound].map((match, index) => (
            <React.Fragment key={match.id}>
              <MatchRow match={match} />
              {index < matchesByRound[selectedRound].length - 1 && <Divider />}
            </React.Fragment>
          ))
        ) : (
          <Typography sx={{ mt: 3, textAlign: 'center' }}>No hay partidos para esta fecha.</Typography>
        )}
      </Box>
    </Box>
  );
}
