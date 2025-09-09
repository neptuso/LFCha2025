import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel
} from '@mui/material';
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

  return shields[teamName] || '/shields/default.png'; // Escudo por defecto
};

function descendingComparator(a, b, orderBy) {
  let valA, valB;

  if (orderBy === 'total') {
    valA = a.yellow_cards + a.red_cards;
    valB = b.yellow_cards + b.red_cards;
  } else {
    valA = a[orderBy];
    valB = b[orderBy];
  }

  if (valB < valA) {
    return -1;
  }
  if (valB > valA) {
    return 1;
  }
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState('total'); // Default sort by total cards
  const [order, setOrder] = useState('desc'); // Default sort descending

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const headCells = [
    { id: 'position', label: '#', align: 'left', sortable: false },
    { id: 'team_name', label: 'Equipo', align: 'left', sortable: true },
    { id: 'yellow_cards', label: 'Amarillas', align: 'center', sortable: true },
    { id: 'red_cards', label: 'Rojas', align: 'center', sortable: true },
    { id: 'total', label: 'Total', align: 'center', sortable: true },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/cards-by-team?competition_id=1`);
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar tarjetas por equipo", err);
        setError("No se pudieron cargar los datos de tarjetas");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>🟥 Tarjetas por Equipo</Typography>
      
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
                  {team.team_name}
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
    </Box>
  );
}
