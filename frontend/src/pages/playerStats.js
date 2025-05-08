import { useState } from 'react';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import './playerStats.css';

const PlayerStats = () => {
  const [playerId, setPlayerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [game, setGame] = useState('all');
  const [stats, setStats] = useState([]);
  
  // Асинхронная функция для обработки отправки формы с данными по игроку
  const handlePlayerSearch = async (e) => {
    e.preventDefault();

    // Проверяем, что дата начала меньше даты конца
    if ((endDate) && (startDate) && (endDate < startDate)) { //первые две скобки проверяют, что значения не нулевые и пользователь не оставил поля пустыми специально
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

        const data = await response.json();
        setStats(data.stats);
        console.log('Ответ от сервера:', data);
        // Здесь потом будем строить графики на основе полученных данных
    }

    catch (error) {
        console.error("Ошибка при получении данных:", error);
        alert("Произошла ошибка при получении статистики игрока.");
    }
  };
  
  // Функция для получения уровней с наибольшим числом поражений
  const mostLostLevels = useMemo(() => { // useMemo - хук, который позволяет оптимизировать производительность, запоминает результат функции и пересчитывает его только при изменении переменной stats)
    if (!stats || stats.length === 0) return { levels: [], count: 0 }; // если нет данных, возвращаем пустой массив и 0 (нужна ли эта строка?)
  
    const losses = stats.filter(item => item.result === false); // фильтруем массив stats, оставляя только те элементы, где результат - поражение (false)
  
    const lossCounts = {}; // создаём объект для хранения количества поражений по уровням, перебираем массив losses и считаем количество поражений по каждому уровню
    losses.forEach(item => {
      const level = item.level_id;
      lossCounts[level] = (lossCounts[level] || 0) + 1; // если уровень уже есть в объекте, увеличиваем его значение на 1, если нет - создаём его со значением 1
    });
  
    const maxLosses = Math.max(...Object.values(lossCounts)); // находим максимальное количество поражений среди всех уровней
  
    const worstLevels = Object.entries(lossCounts) // преобразуем объект lossCounts в массив пар [ключ, значение], где ключ - это уровень, а значение - количество поражений
      .filter(([_, count]) => count === maxLosses) // фильтруем массив, оставляя только те пары, где количество поражений равно максимальному
      .map(([levelId]) => levelId); // преобразуем массив пар обратно в массив уровней, оставляя только ключи (уровни)
  
    return { levels: worstLevels, count: maxLosses };
  }, [stats]); 

  // Функция для получения процента попыток с максимальным количеством набранных очков от всех пройденных уровней
  const maxPointsRatio = useMemo(() => {
    if (!stats || stats.length === 0) return { percentage: 0, total: 0, perfect: 0 };
  
    let total = 0;
    let perfect = 0;
  
    stats.forEach(item => {
      if (item.result === true) {
        total += 1;
        if (item.points === item.max_points) {
          perfect += 1;
        }
      }
    });
  
    const percentage = total > 0 ? Math.round((perfect / total) * 100) : 0;
  
    return { percentage, total, perfect };
  }, [stats]);

  // Функция для получения количества попыток по играм
  const attemptsPerGame = useMemo(() => {
    if (!stats || stats.length === 0) return [];
  
    const gameCounts = {};
  
    stats.forEach(item => {
      const gameId = item.game_id;
      if (gameId) {
        gameCounts[gameId] = (gameCounts[gameId] || 0) + 1;
      }
    });
  
    return Object.entries(gameCounts).map(([game, count]) => ({
      game,
      attempts: count,
    }));
  }, [stats]);

  return (
    <div className="main">

        {/* Форма для ввода данных по игроку */}
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

        <div className="stats">
            {/* Отображение статистики */}
            {mostLostLevels && ( // проверяем, что mostLostLevels существует и не пустой
                <div className="stats-container" style={{ backgroundColor: '#fff3f3' }}>
                    <h3 style={{ color: '#c62828' }}>
                    Уровни с наибольшим числом поражений
                    </h3>
                    {mostLostLevels.levels.length > 0 ? ( // если есть уровни с поражениями, отображаем их
                    <>
                        <p style={{ fontSize: '24px', margin: '10px 0', color: '#d32f2f' }}>
                        {mostLostLevels.levels.join(', ')}
                        </p>
                        <p style={{ fontSize: '16px', color: '#b71c1c' }}>
                        Количество поражений: {mostLostLevels.count}
                        </p>
                    </>
                    ) : ( // если нет уровней с поражениями, отображаем сообщение
                    <p style={{ fontSize: '16px', color: '#b71c1c' }}>
                        Количество поражений: 0
                    </p>
                    )}
                </div>
            )}

            {maxPointsRatio && (
                <div className="stats-container" style={{ backgroundColor: '#81C784' }}>
                    <h3 style={{ color: '#1B1B1B' }}>
                    % попыток с максимальным количеством набранных очков от всех пройденных уровней:
                    </h3>
                    <p style={{ fontSize: '16px', color: '#1B1B1B' }}>
                    {maxPointsRatio.percentage}% ({maxPointsRatio.perfect} из {maxPointsRatio.total} попыток)
                    </p>
                </div>
            )}

            {attemptsPerGame && (
                <div className="stats-container">
                    <h3 className="chart-title">Количество попыток по играм</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                        layout="vertical"
                        data={attemptsPerGame}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                        >
                        <XAxis type="number" />
                        <YAxis dataKey="game" type="category" />
                        <Bar dataKey="attempts" fill="#4F93E6">
                            <LabelList dataKey="attempts" position="right" />
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    </div>
  );
};

export default PlayerStats;
