import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  AppBar, 
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Tabla', path: '/' },
//    { text: 'Calendario', path: '/calendar' },
    { text: 'Goleadores', path: '/top-scorers' },
//    { text: 'Goles por Minuto', path: '/stats/goals-by-minute' },
//    { text: 'Goleadores por Equipo', path: '/stats/top-scorers-by-team' },
    { text: 'Tarjetas por Equipo', path: '/stats/cards-by-team' },
//    { text: 'Rachas', path: '/stats/streaks' },
    { text: 'Almanac', path: '/almanac'}, 
    { text: 'Eventos', path: '/events' },
    { text: 'Calendario', path: '/calendar' },
//    { text: 'Admin', path: '/admin/matches'}   
  ];
// <Button component={Link} to="/admin/matches" sx={{ color: 'white' }}>Admin</Button>
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <Box sx={{ height: 64 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: 'primary.main',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)'
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4, fontWeight: 'bold' }}>
            Liga Chajari 2025
          </Typography>
          
          {/* Botón para móviles */}
          <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Menú para desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ color: 'white', fontWeight: 'medium' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para móviles */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}