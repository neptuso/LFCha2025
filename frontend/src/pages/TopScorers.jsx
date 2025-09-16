import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Importar Link
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  CircularProgress,
  Alert,
  Select, MenuItem, FormControl, InputLabel,
  Link // Importar Link de MUI para el estilo
} from '@mui/material';
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

export default function TopScorers() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el selector
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');

  // 1. Cargar competiciones
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/competitions`);
        setCompetitions(response.data);
        if (response.data.length > 0) {
          setSelectedComp(response.data[0].id);
        }
      } catch (err) {
        console.error("Error al cargar competiciones", err);
        setError("No se pudo cargar la lista de competiciones.");
      }
    };
    loadCompetitions();
  }, []);

  // 2. Cargar goleadores cuando cambie la competición
  useEffect(() => {
    if (!selectedComp) return;

    const fetchScorers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/top-scorers/${selectedComp}`);
        setScorers(response.data);
      } catch (err) {
        console.error("Error al cargar goleadores", err);
        setError("No se pudieron cargar los goleadores.");
      } finally {
        setLoading(false);
      }
    };
    fetchScorers();
  }, [selectedComp]);

  const handleCompChange = (event) => {
    setSelectedComp(event.target.value);
  };

  if (competitions.length === 0 && !error) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }
  
  if (error && competitions.length === 0) {
      return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div">🏆 Top Goleadores</Typography>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="comp-select-label">Competición</InputLabel>
          <Select
            labelId="comp-select-label"
            id="comp-select"
            value={selectedComp}
            label="Competición"
            onChange={handleCompChange}
          >
            {competitions.map((comp) => (
              <MenuItem key={comp.id} value={comp.id}>
                {comp.full_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 'bold'}}>#</TableCell>
                <TableCell sx={{fontWeight: 'bold'}}>Jugador</TableCell>
                <TableCell sx={{fontWeight: 'bold'}}>Equipo</TableCell>
                <TableCell align="right" sx={{fontWeight: 'bold'}}>Goles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scorers.map((scorer, index) => (
                <TableRow key={scorer.player_id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={`/player-goals/${scorer.player_id}`} sx={{ textDecoration: 'none', color: 'inherit', fontWeight: '500', '&:hover': { textDecoration: 'underline' } }}>
                      {scorer.player_name}
                    </Link>
                  </TableCell>
                  <TableCell>{scorer.team_name}</TableCell>
                  <TableCell align="right">{scorer.goals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}