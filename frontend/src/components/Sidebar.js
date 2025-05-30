import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // стили в отдельном файле

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const roleLinks = {
    admin: [
      { path: '/querybuilder', label: 'Конструктор запросов' },
      { path: '/playerstats', label: 'Статистика игрока' },
      { path: '/gamestats', label: 'Отчёт по игре' },
    ],
    analyst: [
      { path: '/querybuilder', label: 'Конструктор запросов' },
      { path: '/playerstats', label: 'Статистика игрока' },
      { path: '/gamestats', label: 'Отчёт по игре' },
    ],
    support: [
      { path: '/playerstats', label: 'Статистика игрока' },
    ],
    manager: [
      { path: '/playerstats', label: 'Статистика игрока' },
      { path: '/gamestats', label: 'Отчёт по игре' },
    ],
  };
  
  const linksToRender = roleLinks[role];

  return (
    <div className="sidebar">
      <h2>Меню</h2>
      <ul>
        {linksToRender.map(link => (
          <li key={link.path}>
            <a href={link.path}>{link.label}</a>
          </li>
        ))}
      </ul>
      <button 
        style={{ marginTop: '5px', color: 'black' }}
        onClick={() => {
          const confirmDelete = window.confirm("Вы уверены, что хотите выйти?");
          if (!confirmDelete) return;
          localStorage.clear();
          navigate('/login'); // перенаправление на страницу входа
        }}
      >
        Выйти
      </button>
    </div>
  );
};

export default Sidebar;