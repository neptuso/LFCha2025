import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminMatches() {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>⚙️ Panel de Administración</Typography>
      <Typography variant="body1">
        Aquí puedes ver y gestionar los datos de partidos.
      </Typography>
      <br />
      <Typography variant="body2" color="text.secondary">
        Esta vista está diseñada para uso interno.
      </Typography>
    </Box>
  );
}