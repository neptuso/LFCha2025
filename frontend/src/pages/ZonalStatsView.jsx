import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Paper } from '@mui/material';
import { fetchAllCompetitions, fetchZonalStandings } from '../services/api';
import StandingsTable from '../components/StandingsTable';

export default function ZonalStatsView() {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar todas las competiciones al montar el componente
    const loadCompetitions = async () => {
      try {
        const data = await fetchAllCompetitions();
        setCompetitions(data);
      } catch (error) {
        console.error("Error al cargar competiciones:", error);
      }
    };
    loadCompetitions();
  }, []);

  const handleCompetitionChange = async (event) => {
    const competitionName = event.target.value;
    setSelectedCompetition(competitionName);

    if (competitionName) {
      setLoading(true);
      setStandings([]); // Limpiar tabla anterior
      try {
        const data = await fetchZonalStandings(competitionName);
        setStandings(data);
      } catch (error) {
        console.error(`Error al cargar la tabla para ${competitionName}:`, error);
      }
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Estadísticas por Zona</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="competition-select-label">Seleccionar Competición</InputLabel>
          <Select
            labelId="competition-select-label"
            value={selectedCompetition}
            label="Seleccionar Competición"
            onChange={handleCompetitionChange}
          >
            <MenuItem value="">
              <em>-- Seleccione --</em>
            </MenuItem>
            {competitions.map((comp) => (
              <MenuItem key={comp.id} value={comp.name}>
                {comp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {standings.length > 0 && !loading && (
        <StandingsTable standings={standings} />
      )}

      {!selectedCompetition && !loading && (
         <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            Por favor, selecciona una competición para ver la tabla de posiciones.
          </Typography>
      )}
    </Box>
  );
}
