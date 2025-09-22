const teamDisplayData = {
  'TIRO FEDERAL (CHAJARI)': { shield: '/shields/tiro_federal.png', abbr: 'TIR' },
  'LA FLORIDA (CHAJARI)': { shield: '/shields/la_florida.png', abbr: 'FLO' },
  'VELEZ SARSFIELD (CHAJARI)': { shield: '/shields/vel.png', abbr: 'VEL' },
  'CHACARITA (CHAJARI)': { shield: '/shields/chacarita.png', abbr: 'CHA' },
  'MOCORETA': { shield: '/shields/mocoreta.png', abbr: 'MOC' },
  'SAN JOSE OBRERO': { shield: '/shields/san_jose_obrero.png', abbr: 'SJO' },
  'SAN FRANCISCO': { shield: '/shields/san_francisco.png', abbr: 'SFR' },
  'INDEPENDIENTE (VDR)': { shield: '/shields/independiente.png', abbr: 'IND' },
  '1° DE MAYO (CHAJARI)': { shield: '/shields/primero_de_mayo.png', abbr: '1DM' },
  'SANTA ROSA': { shield: '/shields/santa_rosa.png', abbr: 'SR' },
  'FERROCARRIL': { shield: '/shields/ferrocarril.png', abbr: 'FER' },
  'SANTA ANA': { shield: '/shields/santa_ana.png', abbr: 'STA' },
  'SAN CLEMENTE': { shield: '/shields/san_clemente.png', abbr: 'SCL' },
  'LOS CONQUISTADORES': { shield: '/shields/los_conquistadores.png', abbr: 'LCQ' },
  // Nombres que podrían venir de la API de standings
  'TIRO FEDERAL': { shield: '/shields/tiro_federal.png', abbr: 'TIR' },
  'LA FLORIDA': { shield: '/shields/la_florida.png', abbr: 'FLO' },
  'VELEZ SARSFIELD': { shield: '/shields/vel.png', abbr: 'VEL' },
  'CHACARITA': { shield: '/shields/chacarita.png', abbr: 'CHA' },
  'INDEPENDIENTE': { shield: '/shields/independiente.png', abbr: 'IND' },
  '1° DE MAYO': { shield: '/shields/primero_de_mayo.png', abbr: '1DM' },
};

const defaultDisplay = { shield: '/shields/default.png', abbr: '???' };

export const getTeamDisplay = (teamName) => {
  if (!teamName) return defaultDisplay;
  // Normalizar el nombre para buscar (quitar paréntesis y espacios extra)
  const normalizedName = teamName.replace(/\s*\(.*\)\s*/, '').trim();
  return teamDisplayData[teamName] || teamDisplayData[normalizedName] || defaultDisplay;
};
