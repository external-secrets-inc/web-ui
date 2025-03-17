import { Outlet } from 'react-router-dom';
import AppTopBar from './components/AppTopBar';
import ExpirySubscriptionBanner from './components/ExpirySubscriptionBanner';
import { PageLoading } from './components/ui/PageLoading';
import { DialogLoading } from './components/ui/DialogLoading';

const App = () => {
  return (
      <>
        <AppTopBar />
        <main className="container mx-auto text-left flex flex-col py-6 md:py-11 relative">
          <ExpirySubscriptionBanner />
          <Outlet />
          {/* Add loading components */}
          <PageLoading />
          <DialogLoading />
        </main>
      </>
  );
};

export default App;
