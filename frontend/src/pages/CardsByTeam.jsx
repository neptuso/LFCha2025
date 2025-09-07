import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Chip } from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';
//const API_BASE = 'http://localhost:8000';

export default function CardsByTeam() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/stats/cards-by-team?competition_id=1`);
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
      <Typography variant="h4" gutterBottom>Tarjetas por Equipo</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Total de tarjetas amarillas y rojas por equipo
      </Typography>

      <List>
        {data.length === 0 ? (
          <ListItem>
            <ListItemText primary="No hay datos disponibles" />
          </ListItem>
        ) : (
          data.map(([teamName, cards]) => (
            <ListItem 
              key={teamName} 
              sx={{ 
                borderBottom: '1px solid #eee',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <ListItemText
                primary={teamName}
                secondary={
                  <>
                    <Chip 
                      label={`${cards.amarillas} Amarillas`} 
                      color="warning" 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${cards.rojas} Rojas`} 
                      color="error" 
                      size="small"
                    />
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}