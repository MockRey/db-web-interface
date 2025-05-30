import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import StartPage from './pages/startPage';
import QueryBuilder from './pages/queryBuilder';
import PlayerStats from './pages/playerStats';
import GameStats from './pages/gameStats';
import LoginPage from './pages/loginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route
            path="start"
            element={
              <ProtectedRoute>
                <StartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="querybuilder"
            element={
              <ProtectedRoute>
                <QueryBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="playerstats"
            element={
              <ProtectedRoute>
                <PlayerStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="gamestats"
            element={
              <ProtectedRoute>
                <GameStats />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="not-found">Ошибка 404</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;