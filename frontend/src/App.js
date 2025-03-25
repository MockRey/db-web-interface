import React, { useState } from 'react';
import './App.css';

function App() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Функция для выполнения SQL-запроса
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:3000/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });

    const data = await response.json();
    setResult(data.data || []);
  };

  // Функция для загрузки шаблонов
  const loadTemplates = async () => {
    const response = await fetch('http://localhost:3000/templates');
    const data = await response.json();
    setTemplates(data.templates || []);
  };

  // Функция для подстановки шаблона в форму
  const handleTemplateClick = (templateSql) => {
    setSql(templateSql);
  };

  // Загружаем шаблоны при монтировании компонента
  React.useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="App">
      <h1>SQL Query Interface</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows="4"
          cols="50"
          placeholder="Enter your SQL query"
        />
        <br />
        <button type="submit">Execute Query</button>
      </form>

      <h2>Saved Templates</h2>
      <div>
        {templates.map((template) => (
          <button key={template.id} onClick={() => handleTemplateClick(template.sql)}>
            {template.name}
          </button>
        ))}
      </div>

      <h2>Query Result</h2>
      <table border="1">
        <thead>
          <tr>
            {result.length > 0 && Object.keys(result[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {result.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => <td key={idx}>{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;