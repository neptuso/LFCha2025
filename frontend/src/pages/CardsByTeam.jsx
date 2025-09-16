
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel,
  Select, MenuItem, FormControl, InputLabel, Avatar
} from '@mui/material';
import axios from 'axios';

//const API_BASE = 'http://localhost:8000';
const API_BASE = 'https://lfcha2025.onrender.com';

// --- Lógica de Ordenamiento (sin cambios) ---
function descendingComparator(a, b, orderBy) {
  let valA, valB;
  if (orderBy === 'total') {
    valA = a.yellow_cards + a.red_cards;
    valB = b.yellow_cards + b.red_cards;
  } else {
    valA = a[orderBy];
    valB = b[orderBy];
  }
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function CardsByTeam() {
  // --- Estados ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('total');
  const [order, setOrder] = useState('desc');
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');

  // --- Carga de Datos ---
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

  useEffect(() => {
    if (!selectedComp) return;
    const loadCardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/stats/cards-by-team?competition_id=${selectedComp}`);
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar tarjetas por equipo", err);
        setError("No se pudieron cargar los datos de tarjetas.");
      } finally {
        setLoading(false);
      }
    };
    loadCardData();
  }, [selectedComp]);

  // --- Handlers y Definiciones de UI ---
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCompChange = (event) => {
    setSelectedComp(event.target.value);
  };

  const headCells = [
    { id: 'position', label: '#', align: 'left', sortable: false },
    { id: 'team_name', label: 'Equipo', align: 'left', sortable: true },
    { id: 'yellow_cards', label: 'Amarillas', align: 'center', sortable: true },
    { id: 'red_cards', label: 'Rojas', align: 'center', sortable: true },
    { id: 'total', label: 'Total', align: 'center', sortable: true },
  ];

  // --- Renderizado ---
  if (competitions.length === 0 && !error) {
      return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          🟥 Tarjetas por Equipo
        </Typography>
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
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table aria-label="tabla de tarjetas por equipo">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{ fontWeight: 'bold', ...(headCell.id === 'yellow_cards' && { backgroundColor: '#ffc107', color: 'black' }), ...(headCell.id === 'red_cards' && { backgroundColor: '#d32f2f', color: 'white' }) }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(data, getComparator(order, orderBy)).map((team, index) => (
                <TableRow key={team.team_name}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={team.shield_url} sx={{ width: 24, height: 24, mr: 1 }} />
                      {team.display_name}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{team.yellow_cards}</TableCell>
                  <TableCell align="center">{team.red_cards}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {team.yellow_cards + team.red_cards}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
