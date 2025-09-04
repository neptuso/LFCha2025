import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Link,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export default function CalendarView() {
  const [matchesByMonth, setMatchesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ✅ Estado para cachear los datos
  const [cachedData, setCachedData] = useState(null);

  useEffect(() => {
    const load = async () => {
      // ✅ Si ya tenemos datos en caché, no volvemos a cargar
      if (cachedData) {
        setMatchesByMonth(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE}/api/matches`);
        const grouped = response.data.reduce((acc, match) => {
          if (!match.date) return acc;
          const date = new Date(match.date);
          const monthYear = date.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
          }).toUpperCase();

          if (!acc[monthYear]) acc[monthYear] = [];
          acc[monthYear].push(match);
          return acc;
        }, {});

        // ✅ Guardar en caché
        setCachedData(grouped);
        setMatchesByMonth(grouped);
      } catch (err) {
        console.error("Error al cargar calendario", err);
        setError("No se pudo cargar el calendario. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cachedData]); // ✅ Dependencia: solo vuelve a ejecutar si cachedData cambia

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const months = Object.keys(matchesByMonth);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        📅 Calendario Mensual
      </Typography>

      {months.length === 0 ? (
        <Typography>No hay partidos programados.</Typography>
      ) : (
        months.map((monthYear) => (
          <Accordion key={monthYear} defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1).toLowerCase()}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {matchesByMonth[monthYear].map((match) => {
                if (!match || !match.id) return null;

                const dateObj = new Date(match.date);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                });
                const timeString = dateObj.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <React.Fragment key={match.id}>
<ListItem
  component={Link}
  to={`/match/${match.id}`}
  sx={{
    borderRadius: 2,
    mb: 1,
    bgcolor: 'action.hover',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      bgcolor: 'action.selected',
    }
  }}
>
  <ListItemText
    primary={
      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
        {match.home_team.name} vs {match.away_team.name}
      </Typography>
    }
    secondary={
      <>
        <Typography component="span" variant="body2" color="textPrimary">
          {formattedDate} - {timeString}
        </Typography>
        <br />
        <Typography component="span" variant="body2" color="textSecondary">
          {match.facility} | {match.status} | Ronda: {match.round || 'N/A'}
        </Typography>
        {(match.home_score !==null || match.away_score!==null) && (
          <>
            <br />
            <Typography component="span" variant="body2" color="primary">
              Resultado: {match.home_score ?? '?'} - {match.away_score ?? '?'}
            </Typography>
          </>
        )}
      </>
    }
  />
</ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}