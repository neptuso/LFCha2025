import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

//const API_BASE = 'https://lfcha2025.onrender.com';
const API_BASE = 'http://localhost:8000';

export default function TopScorersByTeam() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/stats/top-scorers-by-team?competition_id=1`);
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar top goleadores por equipo", err);
        setError("No se pudieron cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  const teams = Object.keys(data);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Top Goleadores por Equipo</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Máximos anotadores de cada club
      </Typography>

      {teams.length === 0 ? (
        <Typography>No hay datos disponibles</Typography>
      ) : (
        teams.map((teamName) => (
          <Accordion key={teamName}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{teamName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {data[teamName].map(([playerName, goals]) => (
                  <ListItem key={playerName}>
                    <ListItemText
                      primary={`${playerName}`}
                      secondary={`${goals} goles`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}