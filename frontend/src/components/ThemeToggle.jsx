import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <Tooltip title="Cambiar tema">
      <IconButton 
        onClick={() => setDarkMode(!darkMode)} 
        color="inherit"
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}