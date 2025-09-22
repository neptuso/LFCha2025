import axios from 'axios';


export const API_BASE = import.meta.env.VITE_API_BASE_URL;  // ✅ Producción

export const fetchStandings = async (competitionId) => {
  const response = await axios.get(`${API_BASE}/api/standings/${competitionId}`);
  return response.data;
};

export const fetchMatches = async ({ date = '', teamId = '', round = '' }) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (teamId) params.append('team_id', teamId);
  if (round) params.append('round', round);
  const response = await axios.get(`${API_BASE}/api/matches?${params}`);
  return response.data;
};

export const fetchRounds = async () => {
  const response = await axios.get(`${API_BASE}/api/rounds`);
  return response.data;
};

export const fetchCalendarMatches = async (year, month) => {
  const response = await axios.get(`${API_BASE}/api/calendar-matches?year=${year}&month=${month}`);
  return response.data;
};

export const fetchDashboardData = async () => {
  const response = await axios.get(`${API_BASE}/api/main-dashboard-data`);
  return response.data;
};

export const fetchCalendarView = async () => {
  const response = await axios.get(`${API_BASE}/api/calendar-view`);
  return response.data;
};

export const fetchAllCompetitions = async () => {
  const response = await axios.get(`${API_BASE}/api/competitions`);
  return response.data;
};

export const fetchZonalStandings = async (competitionName) => {
  const response = await axios.get(`${API_BASE}/api/zonal-standings?competition_name=${encodeURIComponent(competitionName)}`);
  return response.data;
};