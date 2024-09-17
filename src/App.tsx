import { Outlet } from 'react-router-dom';

const App = () => {

  return (
    <div className="app-layout">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        header
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default App;