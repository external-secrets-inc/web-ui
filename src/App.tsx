import { Outlet } from 'react-router-dom';
import AppTopBar from './components/AppTopBar';
import ExpirySubscriptionBanner from './components/ExpirySubscriptionBanner';

const App = () => {
  return (
      <>
        <AppTopBar />
        <main className="container mx-auto text-left flex flex-col py-6 md:py-11">
          <ExpirySubscriptionBanner />
          <Outlet />
        </main>
      </>
  );
};

export default App;