import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import axios from 'axios';

const API_BASE = 'https://lfcha2025.onrender.com';

export default function GoalsByMinute() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await axios.get(`${API_BASE}/api/stats/goals-by-minute`);
      setData(response.data.minutes);
    };
    load();
  }, []);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Goles por Minuto</Typography>
      <div style={{ display: 'flex', overflowX: 'auto', gap: 2 }}>
        {data.map((count, minute) => (
          <div key={minute} style={{
            minWidth: 20,
            height: count * 5,
            backgroundColor: count > 0 ? '#1976d2' : '#e0e0e0',
            border: '1px solid #ccc'
          }}>
            <div style={{ fontSize: 10, transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
              {minute}'
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}