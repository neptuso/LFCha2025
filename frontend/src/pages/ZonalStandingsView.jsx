// frontend/src/pages/ZonalStandingsView.jsx
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
  Grid // Import Grid for layout
} from '@mui/material';
import axios from 'axios';
import StandingsTable from '../components/StandingsTable'; // Adjusted path

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

const ZonalStandingsView = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  
  // State for zones
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState({ competitions: true, standings: true, zones: false });
  const [error, setError] = useState(null);

  // 1. Fetch competitions on mount
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(prev => ({ ...prev, competitions: true }));
        const response = await axios.get(`${API_BASE}/api/competitions`);
        const comps = response.data;
        setCompetitions(comps);

        const defaultComp = comps.find(
          comp => comp.name.includes("PRIMERA DIVISIÓN") && comp.season === "2025"
        );
        if (defaultComp) {
          setSelectedCompetitionId(defaultComp.id);
        } else if (comps.length > 0) {
          setSelectedCompetitionId(comps[0].id);
        }
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError("Could not load competitions.");
      } finally {
        setLoading(prev => ({ ...prev, competitions: false }));
      }
    };
    fetchCompetitions();
  }, []);

  // 2. Fetch zones when competition changes
  useEffect(() => {
    const fetchZones = async () => {
      if (!selectedCompetitionId) return;

      setZones([]); // Reset zones
      setSelectedZone(''); // Reset selected zone
      setLoading(prev => ({ ...prev, zones: true }));
      try {
        const response = await axios.get(`${API_BASE}/api/competitions/${selectedCompetitionId}/zones`);
        setZones(response.data);
      } catch (err) {
        console.error("Error fetching zones:", err);
        // Not a critical error, maybe the endpoint doesn't exist for this comp
      } finally {
        setLoading(prev => ({ ...prev, zones: false }));
      }
    };

    fetchZones();
  }, [selectedCompetitionId]);

  // 3. Fetch standings when competition or zone changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedCompetitionId) return;

      setLoading(prev => ({ ...prev, standings: true }));
      setError(null);
      try {
        // Build URL with optional zone parameter
        let url = `${API_BASE}/api/standings/${selectedCompetitionId}`;
        if (selectedZone) {
          url += `?zone=${selectedZone}`;
        }
        const response = await axios.get(url);
        setStandings(response.data);
      } catch (err) {
        console.error("Error fetching standings:", err);
        setError("Could not load standings data.");
        setStandings([]);
      } finally {
        setLoading(prev => ({ ...prev, standings: false }));
      }
    };

    fetchStandings();
  }, [selectedCompetitionId, selectedZone]);

  const handleCompetitionChange = (event) => {
    setSelectedCompetitionId(event.target.value);
  };

  const handleZoneChange = (event) => {
    setSelectedZone(event.target.value);
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
        Tabla de Posiciones por Zona
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Competition Selector */}
        <Grid item xs={12} sm={zones.length > 0 ? 6 : 8} md={zones.length > 0 ? 4 : 6}>
          <FormControl fullWidth>
            <InputLabel id="competition-select-label">Competición</InputLabel>
            <Select
              labelId="competition-select-label"
              value={selectedCompetitionId}
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
        </Grid>

        {/* Zone Selector (conditional) */}
        {zones.length > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="zone-select-label">Zona</InputLabel>
              <Select
                labelId="zone-select-label"
                value={selectedZone}
                label="Zona"
                onChange={handleZoneChange}
                disabled={loading.standings || loading.zones}
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

      {/* Loading/Error/Content */}
      {loading.standings ? (
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : standings.length > 0 ? (
        <StandingsTable standings={standings} />
      ) : (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
          No hay datos disponibles para esta selección.
        </Typography>
      )}
    </Box>
  );
};

export default ZonalStandingsView;