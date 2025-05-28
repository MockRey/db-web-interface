import { useState } from 'react';
import { useMemo } from 'react';
import './gameStats.css';

const GameStats = () => {
  const [gameId, setGameId] = useState('DIN');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState([]);
  
  // Асинхронная функция для обработки отправки формы с данными по игроку
  const handleGameSearch = async (e) => {
    e.preventDefault();

    // Проверяем, что дата начала меньше даты конца
    if ((endDate) && (startDate) && (endDate < startDate)) { //первые две скобки проверяют, что значения не нулевые и пользователь не оставил поля пустыми специально
        alert('Задан неверный диапазон дат');
        return;
    }

    // Собираем данные из формы в переменную searchData
    const searchData = {
        gameId,
        startDate,
        endDate,
    };

    try {
        const response = await fetch('http://localhost:3000/game-stats', {
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

        const data = await response.json();
        setStats(data.stats);
        console.log('Ответ от сервера:', data);
    }

    catch (error) {
        console.error("Ошибка при получении данных:", error);
        alert("Произошла ошибка при получении статистики игрока.");
    }
  };

  // Асинхронная функция для вычисления метрик игры
  const useGameMetrics = useMemo(() => {
    if (!stats || stats.length === 0) return null;

    // Количество попыток
    const totalAttempts = stats.length;

    // Процент успешных попыток
    const successfulAttempts = stats.filter(item => item.result === true).length;
    const successRate = (successfulAttempts / totalAttempts) * 100;

    // Количество уникальных игроков
    const uniquePlayers = new Set(stats.map(item => item.player_id)).size;

    // Количество новых игроков
    const start = stats.start_time ? new Date(stats.start_time) : null; // Преобразуем start_time и end_time в объекты Date (если они есть)
    const end = stats.end_time ? new Date(stats.end_time) : null;

    const newPlayerIds = new Set();
    stats.forEach(item => {
    const regDate = new Date(item.registration_date);
    if (
        regDate &&
        (!start || regDate >= start) &&
        (!end || regDate <= end)
    ) {
        newPlayerIds.add(item.player_id);
    }
    });
    const newPlayers = newPlayerIds.size;

    // Среднее время игры на игрока
    const timeByPlayer = {};
    stats.forEach(item => {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);
        const duration = (endTime - startTime) / 1000;

        if (!timeByPlayer[item.player_id]) {
            timeByPlayer[item.player_id] = 0;
        }
        timeByPlayer[item.player_id] += duration;
    });

    const totalTime = Object.values(timeByPlayer).reduce((sum, time) => sum + time, 0);
    const avgPlayTimePerPlayer = uniquePlayers > 0 ? totalTime / uniquePlayers : 0;

    const formatTime = seconds => {
        const hours = Math.floor(seconds/3600)
        const minutes = Math.floor(seconds / 60) - hours * 60;
        const secs = Math.round(seconds % 60);

        if (hours > 0) {
        return `${hours} ч ${minutes} мин ${secs} сек`;
        } else if (minutes > 0) {
        return `${minutes} мин ${secs} сек`;
        }
        return `${secs} сек`;
    };

    return {
        totalAttempts,
        successRate: successRate.toFixed(1), // округлено до 1 знака
        uniquePlayers,
        newPlayers,
        avgPlayTimePerPlayer: formatTime(avgPlayTimePerPlayer),
    };
  }, [stats]);

  // Вычисляем количество игроков по регионам
  const topRegionsByPlayers = useMemo(() => {
    if (!stats || stats.length === 0) return null;
    
    const regionMap = {};
    stats.forEach(({ region, player_id }) => {
      if (!regionMap[region]) {
        regionMap[region] = new Set();
      }
      regionMap[region].add(player_id);
    });

    return Object.entries(regionMap).map(([region, playersSet]) => ({
      region,
      count: playersSet.size,
    })).sort((a, b) => b.count - a.count).slice(0, 5); // Сортируем по убыванию и берем топ-5 регионов
  }, [stats]);

  const levelsInfo = useMemo(() => {
    if (!stats || stats.length === 0) return null;

    const levelData = {};
    stats.forEach(({ level_id, result }) => {
      if (!levelData[level_id]) {
        levelData[level_id] = { total: 0, success: 0 };
      }

      levelData[level_id].total += 1;
      if (result) {
        levelData[level_id].success += 1;
      }
    });

    const resultArray = Object.entries(levelData).map(([level, { total, success }]) => ({
      level,
      totalAttempts: total,
      successRate: total > 0 ? (success / total * 100).toFixed(1) : '0.0',
    }));

    return resultArray;
  }, [stats]);

  const downloadCSV = () => {
    return;
  };

    return (
        <div className="main" style={{ height: '100vh' }}>

            {/* Форма для ввода данных по игроку */}
            <div className="player-stats-input" style={{ height: '10%' }}>
                <h1>Отчёт по игре</h1>

                <form onSubmit={handleGameSearch} className="filter-form">
                    <label>
                    Игра:
                    <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
                        <option value="DIN">DIN</option>
                        <option value="VIR">VIR</option>
                        <option value="BOR">BOR</option>
                    </select>
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

                    <button type="submit" className="filter-button">Сгенерировать отчёт</button>
                </form>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', height: '80%', width: '100%' }}>
                <div style={{ display: 'flex', flex: 1, width: '100%' }}>
                    <div style={{ textAlign: 'left', width: '36%', padding: '30px', fontSize: '18px' }}>
                        {useGameMetrics && (
                            <>
                                <h3 style={{ textAlign: 'center' }} >Ключевые показатели:</h3>
                                <p><b>Всего попыток:</b> {useGameMetrics.totalAttempts}</p>
                                <p><b>Процент успешных попыток:</b> {useGameMetrics.successRate}%</p>
                                <p><b>Уникальных игроков:</b> {useGameMetrics.uniquePlayers}</p>
                                <p><b>Новых игроков:</b> {useGameMetrics.newPlayers}</p>
                                <p><b>Среднее время в игре:</b> {useGameMetrics.avgPlayTimePerPlayer}</p>
                            </>
                        )}
                    </div>
                    <div style={{ width: '28%', padding: '30px' }}>
                        {topRegionsByPlayers && (
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '18px' }}>Топ-5 регионов<br />по количеству игроков</h3>
                                <table style={{ width: '90%', borderCollapse: 'collapse', margin: '0 auto', fontSize: '16px' }}>
                                    <thead>
                                    <tr>
                                        <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px', borderRight: '1px solid #ccc' }}>Регион</th>
                                        <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px' }}>Количество уникальных игроков</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {topRegionsByPlayers.map(({ region, count }) => (
                                        <tr key={region}>
                                        <td style={{ borderBottom: '1px solid #eee', padding: '8px', borderRight: '1px solid #ccc', }}>{region}</td>
                                        <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{count}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div style={{ width: '36%', padding: '30px' }}>
                        {levelsInfo && (
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '18px' }}>Распределение попыток<br />по уровням</h3>
                                <table style={{ width: '90%', borderCollapse: 'collapse', margin: '0 auto', fontSize: '16px' }}>
                                    <thead>
                                    <tr>
                                        <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px', borderRight: '1px solid #ccc' }}>Уровень</th>
                                        <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px', borderRight: '1px solid #ccc', }}>Количество попыток</th>
                                        <th style={{ borderBottom: '1px solid #ccc', textAlign: 'center', padding: '8px' }}>Доля успешных попыток</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {levelsInfo.map(({ level, totalAttempts, successRate }) => (
                                        <tr key={level}>
                                        <td style={{ borderBottom: '1px solid #eee', padding: '8px', borderRight: '1px solid #ccc', whiteSpace: 'nowrap' }}>{level}</td>
                                        <td style={{ borderBottom: '1px solid #eee', padding: '8px', borderRight: '1px solid #ccc', }}>{totalAttempts}</td>
                                        <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{successRate}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', flex: 1, backgroundColor: 'lightgreen' }}>
                    <div style={{ flex: 1, backgroundColor: 'lightgreen', width: '33%' }}>Лево</div>
                    <div style={{ flex: 1, backgroundColor: 'lightgreen', width: '33%' }}>Право</div>
                </div>
            </div>

            {useGameMetrics && (
                    <div style={{
                        height: '5%', 
                        }}>
                        <button
                            onClick={downloadCSV}
                            style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}
                        >
                            Скачать выборку (CSV)
                        </button>
                    </div>
                )}
        </div>
    )
};

export default GameStats;