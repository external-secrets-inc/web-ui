import { Outlet } from 'react-router-dom';
import AppTopBar from './components/AppTopBar';

const App = () => {
  return (
    <div className="app-layout">
      <AppTopBar />
      <main className="max-w-[1200px] px-6 lg:px-14 mx-auto box-content text-left flex flex-col py-14">
        <Outlet />
      </main>
    </div>
  );
};

export default App;