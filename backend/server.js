require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Разрешаем CORS для фронтенда
app.use(express.json()); // Позволяет серверу работать с JSON-запросами

// Создание пула подключений к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Проверка подключения
pool.connect()
    .then(() => console.log('Подключение к базе данных успешно!'))
    .catch(err => console.error('Ошибка подключения к базе данных:', err));

console.log('Database Config:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

// Базовый маршрут для проверки работы API
app.get('/', (req, res) => {
    res.send('API работает! 🚀');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`✅ Сервер запущен на http://localhost:${port}`);
});

// Эндпоинт для вывода результата запроса
app.post('/query', async (req, res) => {
    try {
        const { sql } = req.body; // Получаем SQL-запрос из тела запроса
        if (!sql) { // Проверяем, что SQL-запрос не пустой
            return res.status(400).json({ error: 'SQL-запрос не должен быть пустым' });
        }

        // Запрещённые команды
        const forbiddenCommands = ['DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'UPDATE', 'INSERT'];
        const normalizedSQL = sql.trim().toUpperCase(); // Приводим к верхнему регистру для проверки

        // Проверяем, содержит ли запрос запрещённые команды
        if (forbiddenCommands.some(cmd => normalizedSQL.startsWith(cmd))) {
            return res.status(403).json({ error: 'Запрос содержит запрещённую команду!' });
        }

        // Выполняем SQL-запрос и ограничиваем результат 100 строками
        const result = await pool.query(sql + ' LIMIT 100'); // Выполняем запрос к базе данных
        if (result.rowCount === 0) { // Проверяем, есть ли данные в результате запроса
            return res.status(404).json({ error: 'Нет данных для отображения' }); // Возвращаем 404-ю ошибку клиенту
        }

        res.json({ data: result.rows }); // Возвращаем результат запроса в формате JSON; в переменную data попадает ответ по запросу к БД
    }
    
    catch (err) { // Обработка ошибок
        console.error('❌ Ошибка выполнения SQL-запроса:', err); // Выводим ошибку в консоль (СЕРВЕРА!!! - браузер не отобразит)
        res.status(500).json({ error: 'Ошибка выполнения SQL-запроса' }); // Возвращаем ошибку клиенту
    }
});

// Эндпоинт для получения списка всех шаблонов с запросами
app.get('/templates', async (req, res) => { // Переменная req не будет использоваться, но необходима для сохранения порядка аргументов
    try {
        const result = await pool.query('SELECT * FROM sql_templates'); // Получаем все шаблоны из таблицы sql_templates
        res.json({ templates: result.rows }); // в переменную templates попадает ответ по запросу к БД
    }
    
    catch (err) {
        console.error('❌ Ошибка при выгрузке шаблонов:', err);
        res.status(500).json({ error: 'Ошибка выгрузки шаблонов' });
    }
});

// Эндпоинт для сохранения шаблона запроса
app.post('/templates', async (req, res) => {
    const { name, sql } = req.body; // Записываем в переменные name и sql значения из тела запроса, пришедшего от клиента
    
    if (!name || !sql) { // Проверяем, что оба поля заполнены
        return res.status(400).json({ error: 'Имя шаблона и SQL-запрос обязательны!' });
    }

    try {
        await pool.query('INSERT INTO sql_templates (name, sql) VALUES ($1, $2) RETURNING *', [name, sql]); // Выполняем запрос в базу на добавление нового шаблона
        res.status(201).json({ message: "Шаблон успешно сохранён!" }); // 201 статус означает, что ресурс был успешно создан; возвращаем сообщение об успехе клиенту
    }
    
    catch (err) {
        console.error('❌ Ошибка при сохранении шаблона:', err);
        res.status(500).json({ error: 'Ошибка сохранения шаблона' });
    }
});

// Эндпоинт для удаления шаблона запроса
app.delete('/templates/:id', async (req, res) => {
    
    const { id } = req.params; // Записываем в переменную id пришедшее значение id шаблона

    try {
        const result = await pool.query("DELETE FROM sql_templates WHERE id = $1 RETURNING *", [id]); // Выполняем запрос в базу на удаление шаблона с указанным id
        if (result.rowCount === 0) { // если запрос прошёл успешно (шаблон удалён), он возвращает количество удалённых строк; если переменная rowCount вернула 0, то шаблон не был найден
            return res.status(404).json({ error: "Шаблон не найден" });
        }

        res.json({ message: "Шаблон успешно удалён" }); // возвращаем сообщение об успехе клиенту
    }
    
    catch (err) {
        console.error("❌ Ошибка при удалении шаблона:", err);
        res.status(500).json({ error: "Ошибка удаления шаблона" });
    }
});

// Эндпоинт для фильтрации play_history и передачи данных по игроку
app.post('/player-stats', async (req, res) => {
    const { playerId, startDate, endDate, game } = req.body;
  
    try {
      // Сначала проверяем, существует ли такой игрок
      const playerCheck = await pool.query('SELECT * FROM players WHERE player_id = $1', [playerId]);
      
      if (playerCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Игрок с таким ID не найден' });
      }
  
      // Строим запрос для получения статистики
      let query = `
        SELECT play_history.*, levels.game_id
        FROM play_history
        JOIN levels ON play_history.level_id = levels.level_id
        WHERE play_history.player_id = $1
          AND play_history.start_time >= $2
          AND play_history.end_time <= $3
      `;
      const params = [playerId, startDate, endDate];
  
      if (game !== 'all') {
        query += ` AND levels.game_id = $4`;
        params.push(game);
      }
  
      const result = await pool.query(query, params);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Нет данных по указанным условиям' });
      }
  
      res.json({ stats: result.rows });
    } 
    
    catch (err) {
      console.error('❌ Ошибка при получении статистики игрока:', err);
      res.status(500).json({ error: 'Ошибка получения статистики игрока' });
    }
  });
  