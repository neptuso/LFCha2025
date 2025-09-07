import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';
//const API_BASE = 'http://localhost:8000';

export default function GoalsByMinute() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/stats/goals-by-minute?competition_id=1`);
        setData(response.data.minutes || []);
      } catch (err) {
        console.error("Error al cargar goles por minuto", err);
        setError("No se pudieron cargar los datos de goles por minuto");
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
      <Typography variant="h4" gutterBottom>Goles por Minuto</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Distribución de goles durante los 90 minutos de partido
      </Typography>
      
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, mt: 2, py: 2 }}>
        {data.map((count, minute) => (
          <Box
            key={minute}
            sx={{
              minWidth: 12,
              height: Math.max(count * 4, 2),
              backgroundColor: count > 0 ? '#1976d2' : '#e0e0e0',
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              fontSize: 8,
              color: 'white',
              fontWeight: 'bold',
              position: 'relative'
            }}
          >
            {count > 0 && (
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                {count}
              </Typography>
            )}
            {minute % 10 === 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  bottom: '-20px', 
                  transform: 'rotate(-45deg)',
                  fontSize: '0.7rem'
                }}
              >
                {minute}'
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Total de goles: {data.reduce((a, b) => a + b, 0)}
      </Typography>
    </Box>
  );
}