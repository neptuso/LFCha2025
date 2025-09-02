import React, { useEffect, useState } from 'react';
import StandingsTable from '../components/StandingsTable';
import { fetchStandings } from '../services/api';
import { Box } from '@mui/material';

export default function Home() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStandings = async () => {
      try {
        const data = await fetchStandings(1); // ID de competición
        setStandings(data);
      } catch (err) {
        console.error("Error al cargar la tabla", err);
        setError("No se pudieron cargar los datos. Revisa el backend.");
      } finally {
        setLoading(false);
      }
    };
    loadStandings();
  }, []);

  if (loading) return <div>Cargando tabla de posiciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Tabla de Posiciones - Primera División 2025</h2>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <StandingsTable standings={standings} />
      </Box>
    </div>
  );
}