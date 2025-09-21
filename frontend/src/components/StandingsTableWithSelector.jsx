// frontend/src/components/StandingsTableWithSelector.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import axios from 'axios';
import StandingsTable from './StandingsTable'; // Asegúrate de que la ruta sea correcta

import { API_BASE } from '../services/api';
//const API_BASE = 'http://localhost:8000';

const StandingsTableWithSelector = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState({ competitions: true, standings: true });
  const [error, setError] = useState(null);

  // 1. Cargar lista de competiciones al montar el componente
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(prev => ({ ...prev, competitions: true }));
        const response = await axios.get(`${API_BASE}/api/competitions`);
        const comps = response.data;
        setCompetitions(comps);

        // 2. Seleccionar "PRIMERA DIVISIÓN 2025" por defecto
        const defaultComp = comps.find(
          comp => comp.name.includes("PRIMERA DIVISIÓN") && comp.season === "2025"
        );
        if (defaultComp) {
          setSelectedCompetitionId(defaultComp.id);
        } else if (comps.length > 0) {
          // Si no se encuentra la predeterminada, seleccionar la primera
          setSelectedCompetitionId(comps[0].id);
        }
      } catch (err) {
        console.error("Error al cargar competiciones:", err);
        setError("No se pudieron cargar las competiciones.");
      } finally {
        setLoading(prev => ({ ...prev, competitions: false }));
      }
    };

    fetchCompetitions();
  }, []);

  // 3. Cargar tabla de posiciones cuando cambia la competición seleccionada
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedCompetitionId) return;

      try {
        setLoading(prev => ({ ...prev, standings: true }));
        setError(null);
        const response = await axios.get(`${API_BASE}/api/standings/${selectedCompetitionId}`);
        setStandings(response.data);
      } catch (err) {
        console.error("Error al cargar la tabla de posiciones:", err);
        setError("No se pudieron cargar los datos de la tabla.");
        setStandings([]); // Limpiar datos anteriores en caso de error
      } finally {
        setLoading(prev => ({ ...prev, standings: false }));
      }
    };

    fetchStandings();
  }, [selectedCompetitionId]);

  const handleCompetitionChange = (event) => {
    setSelectedCompetitionId(event.target.value);
  };

  if (loading.competitions) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error && competitions.length === 0) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tabla de Posiciones
      </Typography>

      {/* Selector de Competición */}
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
        <InputLabel id="competition-select-label">Competición</InputLabel>
        <Select
          labelId="competition-select-label"
          id="competition-select"
          value={selectedCompetitionId || ''}
          label="Competición"
          onChange={handleCompetitionChange}
          disabled={loading.competitions || loading.standings}
        >
          {competitions.map((comp) => (
            <MenuItem key={comp.id} value={comp.id}>
              {comp.full_name || `${comp.name} (${comp.season})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Indicador de carga para la tabla */}
      {loading.standings && selectedCompetitionId && (
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
      )}

      {/* Mensaje de error para la tabla */}
      {error && selectedCompetitionId && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Tabla de Posiciones */}
      {!loading.standings && selectedCompetitionId && standings.length > 0 && (
        <StandingsTable standings={standings} />
      )}

      {/* Mensaje si no hay datos para mostrar */}
      {!loading.standings && selectedCompetitionId && standings.length === 0 && !error && (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
          No hay datos disponibles para esta competición.
        </Typography>
      )}
    </Box>
  );
};

export default StandingsTableWithSelector;