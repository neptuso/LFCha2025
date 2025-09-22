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
import StatsDashboard from './pages/StatsDashboard';
import ZonalStatsView from './pages/ZonalStatsView';
import ZonalStandingsView from './pages/ZonalStandingsView';
import Dashboard from './pages/Dashboard';
import TournamentDashboard from './pages/TournamentDashboard';
import PlayerSanctions from './pages/PlayerSanctions';
import PlayerGoals from './pages/PlayerGoals.jsx';
import PlayerSanctionsDetail from './pages/PlayerSanctionsDetail';
import HomeDashboard from './pages/HomeDashboard'; // Importar el nuevo dashboard

function App() {

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00aeff', // Celeste vibrante
      },
      secondary: {
        main: '#ff3d3d', // Rojo deportivo
      },
      success: {
        main: '#8eff00', // Verde lima para acentos positivos
      },
      background: {
        default: '#1a1a1a', // Fondo principal muy oscuro
        paper: '#282828',   // Fondo para tarjetas y contenedores, ligeramente más claro
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3', // Gris claro para texto secundario
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700, fontSize: '1.75rem' },
      h5: { fontWeight: 600, fontSize: '1.5rem' },
      h6: { fontWeight: 600, fontSize: '1.25rem' },
      subtitle1: { fontWeight: 500 },
      body1: { fontWeight: 400 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Evita gradientes por defecto de MUI en modo oscuro
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          },
          head: {
            fontWeight: 'bold',
            color: '#b3b3b3',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          }
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#8eff00', // Indicador de la pestaña en verde lima
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home-beta" element={<HomeDashboard />} /> {/* Ruta para el nuevo dashboard */}
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/top-scorers" element={<TopScorers />} />
          <Route path="/almanac" element={<AlmanacView />} />
          <Route path="/stats/goals-by-minute" element={<GoalsByMinute />} />
          <Route path="/stats/top-scorers-by-team" element={<TopScorersByTeam />} />
          <Route path="/stats/cards-by-team" element={<CardsByTeam />} />
          <Route path="/stats/player-sanctions" element={<PlayerSanctions />} />
          <Route path="/stats/streaks" element={<StreaksView />} />
          <Route path="/stats" element={<StatsDashboard />} />
          <Route path="/admin/matches" element={<AdminMatches />} />
          <Route path="/events" element={<EventsView />} />
          <Route path="/zonal-stats" element={<ZonalStatsView />} />
          <Route path="/zonal-standings" element={<ZonalStandingsView />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournament" element={<TournamentDashboard />} />
          <Route path="/player-goals/:playerId" element={<PlayerGoals />} />
          <Route path="/player-sanctions-detail/:playerId" element={<PlayerSanctionsDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;