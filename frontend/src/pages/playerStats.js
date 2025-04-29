import { useState } from 'react';
import './playerStats.css';

const PlayerStats = () => {
  const [playerId, setPlayerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [game, setGame] = useState('all');
  
  // Асинхронная функция для обработки отправки формы с данными по игроку
  const handlePlayerSearch = async (e) => {
    e.preventDefault();

    // Проверяем, что дата начала меньше даты конца
    if (endDate < startDate) {
        alert('Задан неверный диапазон дат');
        return;
    }

    // Собираем данные из формы в переменную searchData
    const searchData = {
        playerId,
        startDate,
        endDate,
        game,
    };

    try {
        const response = await fetch('http://localhost:3000/player-stats', {
        method: 'POST',
        headers: {  'Content-Type': 'application/json'  },
        body: JSON.stringify(searchData),
        });

        // Новый обработчик ошибок - выводит полученную ошибку в алерт, а не в консоль
        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || 'Произошла ошибка');
            return;
        }

        const stats = await response.json();
        console.log('Ответ от сервера:', stats);
        // Здесь потом будем строить графики на основе полученных данных
    }

    catch (error) {
        console.error("Ошибка при получении данных:", error);
        alert("Произошла ошибка при получении статистики игрока.");
    }
  };  

  return (
    <div className="player-stats-input">
      <h1>Статистика игрока</h1>

      <form onSubmit={handlePlayerSearch} className="filter-form">
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

        <button type="submit" className="filter-button">Поиск</button>
      </form>
    </div>
  );
};

export default PlayerStats;
