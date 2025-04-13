import { useState } from 'react';
import './playerStats.css';

const PlayerStats = () => {
  const [playerId, setPlayerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [game, setGame] = useState('all');

  return (
    <div className="player-stats-input">
      <h1>Статистика игрока</h1>

      <form className="filter-form">
        <label>
          ID игрока:
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
        </label>

        <label>
          Дата с:
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          По:
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label>
          Игра:
          <select value={game} onChange={(e) => setGame(e.target.value)}>
            <option value="all">Все</option>
            <option value="DIN">DIN</option>
            <option value="VIR">VIR</option>
            <option value="BOR">BOR</option>
          </select>
        </label>
      </form>
    </div>
  );
};

export default PlayerStats;
