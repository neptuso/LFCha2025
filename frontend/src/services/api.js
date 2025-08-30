import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export const fetchStandings = async (competitionId) => {
  const response = await axios.get(`${API_BASE}/api/standings/${competitionId}`);
  return response.data;
};

export const fetchMatches = async (date = '', teamId = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (teamId) params.append('team_id', teamId);
  const response = await axios.get(`${API_BASE}/api/matches?${params}`);
  return response.data;
};