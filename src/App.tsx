import { Outlet } from 'react-router-dom';
import AppTopBar from './components/AppTopBar';

const App = () => {
  return (
    <div className="app-layout">
      <AppTopBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;