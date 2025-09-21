import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Grid
} from '@mui/material';
import axios from 'axios';
import TopScorersWidget from '../components/TopScorersWidget';
import CleanSheetsWidget from '../components/CleanSheetsWidget';
import PlayerSanctionsWidget from '../components/PlayerSanctionsWidget';

//const API_BASE = 'http://localhost:8000';
import { API_BASE } from '../services/api';

const Dashboard = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState({ competitions: true, zones: false });
  const [error, setError] = useState(null);

  // 1. Cargar competiciones al montar
  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(prev => ({ ...prev, competitions: true }));
      try {
        const response = await axios.get(`${API_BASE}/api/competitions`);
        const comps = response.data;
        setCompetitions(comps);
        if (comps.length > 0) {
          setSelectedCompetitionId(comps[0].id);
        }
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError("No se pudieron cargar las competiciones.");
      } finally {
        setLoading(prev => ({ ...prev, competitions: false }));
      }
    };
    fetchCompetitions();
  }, []);

  // 2. Cargar zonas cuando cambia la competición
  useEffect(() => {
    const fetchZones = async () => {
      if (!selectedCompetitionId) return;
      setZones([]);
      setSelectedZone('');
      setLoading(prev => ({ ...prev, zones: true }));
      try {
        const response = await axios.get(`${API_BASE}/api/competitions/${selectedCompetitionId}/zones`);
        setZones(response.data);
      } catch (err) {
        console.error("Error fetching zones:", err);
      } finally {
        setLoading(prev => ({ ...prev, zones: false }));
      }
    };
    fetchZones();
  }, [selectedCompetitionId]);

  const handleCompetitionChange = (event) => {
    setSelectedCompetitionId(event.target.value);
  };

  const handleZoneChange = (event) => {
    setSelectedZone(event.target.value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Dinámico
      </Typography>

      {loading.competitions ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Selector de Competición */}
          <Grid item xs={12} sm={zones.length > 0 ? 6 : 8} md={zones.length > 0 ? 4 : 6}>
            <FormControl fullWidth>
              <InputLabel id="competition-select-label">Competición</InputLabel>
              <Select
                labelId="competition-select-label"
                value={selectedCompetitionId}
                label="Competición"
                onChange={handleCompetitionChange}
              >
                {competitions.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id}>
                    {comp.full_name || `${comp.name} (${comp.season})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Selector de Zona (condicional) */}
          {loading.zones ? (
            <Grid item><CircularProgress size={24} /></Grid>
          ) : zones.length > 0 && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="zone-select-label">Zona</InputLabel>
                <Select
                  labelId="zone-select-label"
                  value={selectedZone}
                  label="Zona"
                  onChange={handleZoneChange}
                >
                  <MenuItem value="">
                    <em>General</em>
                  </MenuItem>
                  {zones.map((zone) => (
                    <MenuItem key={zone} value={zone}>
                      {zone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      )}

      {/* Contenedor para los widgets de estadísticas */}
      {selectedCompetitionId && (
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={6} lg={4}>
            <TopScorersWidget competitionId={selectedCompetitionId} zone={selectedZone} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <CleanSheetsWidget competitionId={selectedCompetitionId} zone={selectedZone} />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <PlayerSanctionsWidget competitionId={selectedCompetitionId} zone={selectedZone} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;