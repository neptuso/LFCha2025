import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export default function Navbar() {
  return (
    <Box sx={{
      padding: 2,
      backgroundColor: 'primary.main',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1100
    }}>
      <Typography variant="h6" component="span" sx={{ mr: 4 }}>
        Liga Chajari 2025
      </Typography>
      <Button component={Link} to="/" sx={{ color: 'white' }}>Tabla</Button>
      <Button component={Link} to="/calendar" sx={{ color: 'white' }}>Calendario</Button>
      <Button component={Link} to="/top-scorers" sx={{ color: 'white' }}>Goleadores</Button>
    </Box>
  );
}