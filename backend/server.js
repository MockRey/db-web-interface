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
        if (!sql) {
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
        const result = await pool.query(sql + ' LIMIT 100');

        res.json({ data: result.rows });
    } catch (err) {
        console.error('Ошибка выполнения SQL-запроса:', err);
        res.status(500).json({ error: 'Ошибка выполнения запроса' });
    }
});

// Эндпоинт для получения списка всех шаблонов с запросами
app.get('/templates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sql_templates');
        res.json({ templates: result.rows });
    } catch (err) {
        console.error('❌ Ошибка при получении шаблонов:', err);
        res.status(500).json({ error: 'Ошибка получения шаблонов' });
    }
});

// Эндпоинт для сохранения шаблона запроса
app.post('/templates', async (req, res) => {
    const { name, sql } = req.body;
    
    if (!name || !sql) {
        return res.status(400).json({ error: 'Имя шаблона и SQL-запрос обязательны!' });
    }

    try {
        const result = await pool.query('INSERT INTO sql_templates (name, sql) VALUES ($1, $2) RETURNING *', [name, sql]);
        res.status(201).json({ template: result.rows[0] });
    } catch (err) {
        console.error('❌ Ошибка при сохранении шаблона:', err);
        res.status(500).json({ error: 'Ошибка сохранения шаблона' });
    }
});
