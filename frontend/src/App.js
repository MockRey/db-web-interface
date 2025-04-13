import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import QueryBuilder from './pages/queryBuilder';
import PlayerStats from './pages/playerStats';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="querybuilder" element={<QueryBuilder />} />
          <Route path="playerstats" element={<PlayerStats />} />
          <Route path="*" element={<div className='not-found'>Ошибка 404: Такой страницы не существует</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;