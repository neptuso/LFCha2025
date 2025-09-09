import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, {useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import MatchesPage from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import TopScorers from './pages/TopScorers';
import ThemeToggle from './components/ThemeToggle';
import Navbar from './components/Navbar';
import CalendarView from './pages/CalendarView';
import AlmanacView from './pages/AlmanacView';
import GoalsByMinute from './pages/GoalsByMinute';
import TopScorersByTeam from './pages/TopScorersByTeam';
import CardsByTeam from './pages/CardsByTeam';
import StreaksView from './pages/StreaksView';
import AdminMatches from './pages/AdminMatches';
import EventsView from './pages/EventsView';

// ✅ Definir el tema dentro de App(), después de darkMode
function App() {
  const [darkMode, setDarkMode] = useState(true); // ✅ Modo oscuro por defecto

  // ✅ Tema único, definido dentro de App()
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
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: { padding: '6px 16px' }
        }
      }
    }
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
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/top-scorers" element={<TopScorers />} />
          <Route path="/almanac" element={<AlmanacView />} />
          <Route path="/stats/goals-by-minute" element={<GoalsByMinute />} />
          <Route path="/stats/top-scorers-by-team" element={<TopScorersByTeam />} />
          <Route path="/stats/cards-by-team" element={<CardsByTeam />} />
          <Route path="/stats/streaks" element={<StreaksView />} />
          <Route path="/admin/matches" element={<AdminMatches />} />
          <Route path="/events" element={<EventsView />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;