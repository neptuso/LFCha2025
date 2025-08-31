import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Cargar datos del jugador
  }, [id]);

  return (
    <div>
      <h2>{player?.name}</h2>
      <p>Equipo: {player?.team}</p>
      <p>Goles: {player?.goals}</p>
      <p>Tarjetas: {player?.cards}</p>
    </div>
  );
}