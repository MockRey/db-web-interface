import { useState, useEffect } from 'react';
import './queryBuilder.css';

const QueryBuilder = () => { //

  // Переменные состояния для хранения SQL-запроса, его результата и шаблонов
  // useState - React-хук для управления состоянием переменной
  // в параметры useState передаётся начальное значение переменной (первая позиция в массиве)
  // вторая позиция - функция для изменения значения переменной, которая применится дальше в коде
  const [sql, setSql] = useState('');
  const [result, setResult] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Асинхронная функция для отправки SQL-запроса
  const handleSubmit = async (e) => { // параметр e - событие в браузере (в нашем случае - нажатие на кнопку отправки формы)
    e.preventDefault(); // Отменяем стандартное поведение браузера при отправке формы на бэкенд (перезагрузку страницы)
    
    try {
      // Отправляем POST-запрос на сервер с SQL-запросом
      const response = await fetch('http://localhost:3000/query', { // Переменная response - результат выполнения запроса fetch
        method: 'POST', // потому что отправляем данные на сервер
        headers: { 'Content-Type': 'application/json' }, // заголовки указывают, что отправляем SQL-запрос в формате JSON
        body: JSON.stringify({ sql }) // тело запроса, где переменная sql превращается в JSON-строку
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`); // если ответ от сервера не успешный, то выбрасываем ошибку с кодом ответа и текстом
      }

      // Получаем ответ от сервера
      const data = await response.json(); // ждём завершения промиса и преобразуем ответ в JSON
      setResult(data.data || []); // обновляем переменную result (в начале был пустой массив), передавая в неё данные из ответа сервера (или пустой массив, если данных нет)
    }
    
    catch (error) {
      console.error("Ошибка при выполнении SQL-запроса:", error);
      alert("Произошла ошибка при выполнении SQL-запроса.");
    }
  };

  // Асинхронная функция для выгрузки шаблонов с сервера
  const loadTemplates = async () => {

    try {
      const response = await fetch('http://localhost:3000/templates');

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
    }

    catch (error) {
      console.error("Ошибка при выгрузке шаблонов:", error);
      alert("Произошла ошибка при выгрузке шаблонов.");
    }
  };

  // Асинхронная функция для создания нового шаблона
  const createTemplate = async (e) => {
    e.preventDefault();

    const templateName = prompt('Введите название шаблона:'); // вызываем диалоговое окно для ввода названия шаблона

    if (templateName) { // Проверяем, что пользователь не нажал "Отмена"

      try {
        const response = await fetch('http://localhost:3000/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, sql })
        });

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        await loadTemplates(); // Загружаем обновлённый список шаблонов
      } 

      catch (error) {
        console.error("Ошибка при создании шаблона:", error);
        alert("Произошла ошибка при создании шаблона.");
      }
    }
  };

  // Асинхронная функция для удаления существующего шаблона
  const deleteTemplate = async (id) => {

    const confirmDelete = window.confirm("Вы уверены, что хотите удалить шаблон?"); // вызываем диалоговое окно для подтверждения удаления шаблона
    if (!confirmDelete) return; // если пользователь нажал "Отмена", выходим из функции

    try {
      const response = await fetch(`http://localhost:3000/templates/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== id)); // обновляем список шаблонов, не перезагружая страницу, а просто формируя новый список шаблонов без учёта ID удалённого
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    }
    
    catch (error) {
      console.error("Ошибка при удалении шаблона:", error);
      alert("Произошла ошибка при удалении шаблона.");
    }
};

  // Функция для подстановки шаблона в форму
  const handleTemplate = (templateSql) => {
    setSql(templateSql); // обновляем переменную sql, подставляя в неё SQL-запрос из шаблона
  };

  // Загружаем шаблоны при монтировании компонента
  useEffect(() => { // React-хук для выполнения побочных эффектов (в данном случае - загрузка шаблонов с сервера)
    loadTemplates(); // вызываем функцию загрузки шаблонов
  }, []); // пустой массив вторым параметром означает, что эффект будет выполнен только один раз при монтировании компонента

  const downloadCSV = () => {
    if (!result || result.length === 0) return;

    const headers = Object.keys(result[0]).join(',');
    const rows = result.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'query_result.csv';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0' }}>Конструктор запросов</h1>
      <div style={{ display: 'flex', flexDirection: 'column', height: '710px', width: '100%' }}>
        <div style={{ display: 'flex', flex: 1, maxHeight: '200px' }}>
          <div style={{ flex: 1, marginRight: '4px' }}>
            <h2>Форма ввода:</h2>
            <form onSubmit={handleSubmit}> {/* функция handleSubmit выполняется при отправке формы */}
              <textarea
                style={{ height: '100px' }}
                value={sql}
                onChange={(e) => setSql(e.target.value)} // функция onChange вызывает изменение переменной sql при каждом (побуквенном) изменении содержимого textarea
                rows="4" // количество строк в поле ввода
                cols="50" // ширина поля ввода
                placeholder="Введите ваш SQL-запрос здесь"
              />
              <br />
              <button type="submit">Выполнить запрос</button> {/* тип кнопки показывает, что она используется для отправки формы */}
              <button onClick={createTemplate}>Сохранить шаблон</button> {/* при клике на кнопку вызывается функция createTemplate для создания нового шаблона */}
            </form>
          </div>

          <div style={{ flex: 1, marginLeft: '4px' }}>
            <h2>Сохранённые шаблоны:</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #000', borderRadius: '4px', padding: '10px', width: '70%' }}>
                {templates.map((template) => ( // функция map применяется к массиву templates и возвращает массив кнопок с названиями шаблонов
                  <div key={template.id}> {/* атрибут key необходим при парсинге массива; в данном случае - id шаблона */}
                    <button onClick={() => handleTemplate(template.sql)}> {/* при клике на кнопку вызывается функция handleTemplate и подставляет запрос в форму */}
                      {template.name}
                    </button>
                    <button onClick={() => deleteTemplate(template.id)} style={{ background: "red", color: "white" }}> {/*  */}
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: '100%' }}>
          <h2>Результат запроса:</h2>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', maxHeight: '425px', overflowY: 'auto', maxWidth: 'fit-content' }}>
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
          </div>
        </div>
      </div>

      <div>
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
            Скачать статистику (CSV)
        </button>
      </div>
    </div>
  );
}

export default QueryBuilder; // Экспортируем компонент queryBuilder по умолчанию, чтобы его можно было использовать в других файлах