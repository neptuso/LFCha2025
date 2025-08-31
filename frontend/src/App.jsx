// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import MatchesPage from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import TopScorers from './pages/TopScorers';
import ThemeToggle from './components/ThemeToggle';
import Navbar from './components/Navbar';
import CalendarView from './pages/CalendarView'; // ✅ IMPORTACIÓN AÑADIDA

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/calendar" element={<CalendarView />} /> {/* ✅ Ruta correcta */}
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/top-scorers" element={<TopScorers />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

const theme = createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#1976d2' // Azul de Tiro Federal
    },
    secondary: {
      main: '#dc004e' // Rojo para destacados
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 }
  }
});

export default App;