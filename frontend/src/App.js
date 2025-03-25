import React, { useState } from 'react';
import './App.css';

function App() {

  // Переменные состояния для хранения SQL-запроса, его результата и шаблонов
  // useState - React-хук для управления состоянием переменной
  // в параметры useState передаётся начальное значение переменной (первая позиция в массиве)
  // вторая позиция - функция для изменения значения переменной, которая применится дальше в коде
  const [sql, setSql] = useState('');
  const [result, setResult] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Асинхронная функция для отправки SQL-запроса
  const handleSubmit = async (e) => { // параметр e - событие в браузере (в нашем случае - нажатие на кнопку отправки формы)
    e.preventDefault(); // Отменяем стандартное поведение браузера (перезагрузку страницы)
    
    // Отправляем POST-запрос на сервер с SQL-запросом
    const response = await fetch('http://localhost:3000/query', { // Переменная response - результат выполнения запроса fetch
      method: 'POST', // потому что отправляем данные на сервер
      headers: { 'Content-Type': 'application/json' }, // заголовки указывают, что отправляем SQL-запрос в формате JSON
      body: JSON.stringify({ sql }) // тело запроса, где переменная sql превращается в JSON-строку
    });

    // Получаем ответ от сервера
    const data = await response.json(); // ждём завершения промиса и преобразуем ответ в JSON
    setResult(data.data || []); // обновляем переменную result (в начале был пустой массив), передавая в неё данные из ответа сервера (или пустой массив, если данных нет)
  };

  // Асинхронная функция для выгрузки шаблонов с сервера
  const loadTemplates = async () => {
    const response = await fetch('http://localhost:3000/templates');
    const data = await response.json();
    setTemplates(data.templates || []);
  };

  // Функция для подстановки шаблона в форму
  const handleTemplateClick = (templateSql) => {
    setSql(templateSql); // обновляем переменную sql, подставляя в неё SQL-запрос из шаблона
  };

  // Загружаем шаблоны при монтировании компонента
  React.useEffect(() => { // React-хук для выполнения побочных эффектов (в данном случае - загрузка шаблонов с сервера)
    loadTemplates(); // вызываем функцию загрузки шаблонов
  }, []); // пустой массив вторым параметром означает, что эффект будет выполнен только один раз при монтировании компонента

  return (
    <div className="App"> {/* className можно использовать для настройки стилей в App.css */}
      <h1>Конструктор запросов</h1>
      <h2>Форма ввода:</h2>
      
      <form onSubmit={handleSubmit}> {/* функция handleSubmit выполняется при отправке формы */}
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)} // функция onChange вызывает изменение переменной sql при каждом (побуквенном) изменении содержимого textarea
          rows="4" // количество строк в поле ввода
          cols="50" // ширина поля ввода
          placeholder="Введите ваш SQL-запрос здесь"
        />
        <br />
        <button type="submit">Выполнить запрос</button> {/* тип кнопки показывает, что она используется для отправки формы */}
      </form>

      <h2>Сохранённые шаблоны:</h2>
      <div>
        {templates.map((template) => ( // функция map применяется к массиву templates и возвращает массив кнопок с названиями шаблонов
          <button key={template.id} onClick={() => handleTemplateClick(template.sql)}> {/* атрибут key необходим при парсинге массива; при клике на кнопку вызывается функция handleTemplateClick и подставляет запрос в форму */}
            {template.name}
          </button>
        ))}
      </div>

      <h2>Результат запроса:</h2>
      <table border="1"> {/* создание таблицы с минимальной границей */}
        <thead> {/* тег настройки шапки HTML-таблицы */}
          <tr> {/* тег строки таблицы */}
            {result.length > 0 && Object.keys(result[0]).map((key) => <th key={key}>{key}</th>)} {/* если в переменной (массиве) result есть элементы (... > 0), то создаём шапку таблицы с ключами объекта (ключами станут названия столбцов из JSONа с бэкенда); th - тег заголовка таблицы */}
          </tr>
        </thead>
        <tbody> {/* тег тела таблицы */}
          {result.map((row, index) => ( // функция map применяется к массиву result и возвращает массив строк таблицы
            <tr key={index}> {/* tr - тег строки таблицы */}
              {Object.values(row).map((value, idx) => <td key={idx}>{typeof value === 'boolean' ? (value ? 'Completed' : 'Failed') : value}</td>)} {/* td - тег ячейки таблицы; из-за бага добавлено условие: если значение в ячейке - булево, то вместо true/false выводится Completed/Failed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;