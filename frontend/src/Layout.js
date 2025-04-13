import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />        {/* боковое меню, всегда видно */}
      <div className="page-content">
        <Outlet />       {/* сюда будет подставляться содержимое страниц */}
      </div>
    </div>
  );
};

export default Layout;