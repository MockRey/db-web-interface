import { Link } from 'react-router-dom';
import './Sidebar.css'; // стили в отдельном файле

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Меню</h2>
      <ul>
        <li><Link to="/querybuilder">Конструктор запросов</Link></li>
        <li><Link to="/playerstats">Статистика игрока</Link></li>
        <li><Link to="/gamestats">Отчёт по игре</Link></li>
        {/* Здесь можно добавить больше страниц в будущем */}
      </ul>
    </div>
  );
};

export default Sidebar;