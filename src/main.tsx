import { ListAgents } from "@/components/agents/ListAgents";
import AppPageHeader from "@/components/AppPageHeader";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import ResetPassword from "@/components/Auth/ResetPassword";
import AxiosInterceptor from "@/components/AxiosInterceptor";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import RequireActiveUser from "@/components/RequireActiveUser";
import Settings from "@/components/Settings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { Verify } from "@/components/Verify";
import authStore from "@/services/auth/authStore";
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import * as React from "react";
import AuthProvider from 'react-auth-kit';
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { load, page } from './analytics';
import App from './App';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireActiveUser loginFallbackPath="/signup" inactiveFallbackPath="/verify">
        <NavigateWithOrg to="/agents" replace />
      </RequireActiveUser>
    ),
  },
  {
    path: "/verify",
    element: <RequireAuth fallbackPath="/login">
      <Verify />
    </RequireAuth>
  },
  {
    path: '/signup',
    element: <NavigateWithOrg to="/agents" fallbackToSignup replace />,
  },
  {
    path: '/login',
    element: <NavigateWithOrg to="/agents" fallbackToLogin replace />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/:org',
    element: (
      <AxiosInterceptor>
        <RequireActiveUser loginFallbackPath="/login" inactiveFallbackPath="/verify">
          <App />
        </RequireActiveUser>
      </AxiosInterceptor>
    ),
    children: [
      {
        path: 'agents',
        element: (
          <>
            <AppPageHeader
              title="Your Agents"
              description="Monitor existing agents and/or generate new ones"
            />
            <ListAgents />
          </>
        )
      },
      {
        path: 'settings',
        element: (
          <>
            <AppPageHeader
              title="Settings"
              description="Manage your account settings and preferences"
            />
            <Settings />
          </>
        )
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

const Main = () => {
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      load(); // Load Segment analytics on app load

      // Track the initial page load (for refreshes and direct url access)
      page();

      const unlisten = router.subscribe(() => {
        page(); // Subscribe to router changes and call analytics.page() on route change
      });

      return () => {
        unlisten(); // Cleanup to unsubscribe from router changes
      };
    }
  }, []);

  return <RouterProvider router={router} />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider store={authStore}>
        <ThemeProvider storageKey="ui-theme">
          <Main />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}