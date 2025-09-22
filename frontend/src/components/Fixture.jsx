import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Tabs, Tab, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchRounds, fetchMatches } from '../services/api';
import { getTeamDisplay } from '../utils/teamDisplay'; // Importar la utilidad

const MatchRow = ({ match }) => {
  const homeDisplay = getTeamDisplay(match.home_team.name);
  const awayDisplay = getTeamDisplay(match.away_team.name);

  return (
    <Box sx={{ my: 1, p: 1.5, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item xs={10} container alignItems="center" component={RouterLink} to={`/match/${match.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Grid item xs={5} container alignItems="center" justifyContent="flex-end">
            <Typography align="right" sx={{ mr: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}>{match.home_team.name}</Typography>
            <img src={homeDisplay.shield} alt={match.home_team.name} style={{ width: 24, height: 24 }} />
          </Grid>
          <Grid item xs={2} align="center">
            <Typography variant="h6" component="span" sx={{ px: 1, borderRadius: 1 }}>
              {match.home_score ?? '-'} - {match.away_score ?? '-'}
            </Typography>
          </Grid>
          <Grid item xs={5} container alignItems="center">
            <img src={awayDisplay.shield} alt={match.away_team.name} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Typography sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{match.away_team.name}</Typography>
          </Grid>
        </Grid>
        <Grid item xs={2} align="center">
           <Typography variant="caption" display="block">{new Date(match.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</Typography>
           <Typography variant="caption" color="text.secondary">{match.facility}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function Fixture() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRounds = async () => {
      try {
        setLoadingRounds(true);
        const roundsData = await fetchRounds();
        if (roundsData && roundsData.length > 0) {
          setRounds(roundsData);
          setSelectedRound(roundsData[0]);
        }
      } catch (err) {
        setError('No se pudieron cargar las fechas.');
        console.error(err);
      } finally {
        setLoadingRounds(false);
      }
    };
    getRounds();
  }, []);

  const getMatchesForRound = useCallback(async (round) => {
    if (!round) return;
    try {
      setLoadingMatches(true);
      setError(null);
      const matchesData = await fetchMatches({ round });
      setMatches(matchesData);
    } catch (err) {
      setError(`No se pudieron cargar los partidos para la ${round}.`);
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    getMatchesForRound(selectedRound);
  }, [selectedRound, getMatchesForRound]);

  const handleTabChange = (event, newValue) => {
    setSelectedRound(newValue);
  };

  if (loadingRounds) return <CircularProgress />;
  if (error && !loadingMatches) return <Alert severity="error">{error}</Alert>;

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
          {rounds.map(round => (
            <Tab label={round} value={round} key={round} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {loadingMatches ? (
          <CircularProgress />
        ) : matches.length > 0 ? (
          <Grid container spacing={2}>
            {matches.map((match) => (
              <Grid item xs={12} md={6} key={match.id}>
                <MatchRow match={match} />
                <Divider sx={{ mt: 1, display: { md: 'none' } }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            {error || 'No hay partidos para esta fecha.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}