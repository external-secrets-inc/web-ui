import { ListAgents } from "@/components/agents/ListAgents";
import AppPageHeader from "@/components/AppPageHeader";
import AxiosInterceptor from "@/components/AxiosInterceptor";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import ResetPassword from "@/components/ResetPassword";
import Settings from "@/components/Settings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import authStore from "@/services/auth/authStore";
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import * as React from "react";
import AuthProvider from 'react-auth-kit';
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth fallbackPath="/signup">
        <NavigateWithOrg to="/agents" replace />
      </RequireAuth>
    ),
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
    element: <ResetPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/:org',
    element: (
      <AxiosInterceptor>
        <RequireAuth fallbackPath="/login">
          <App />
        </RequireAuth>
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

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider store={authStore}>
        <ThemeProvider storageKey="ui-theme">
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
