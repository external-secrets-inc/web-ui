import { ListAgents } from "@/components/agents/ListAgents";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import * as React from "react";
import AuthProvider from 'react-auth-kit';
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Toaster } from "@/components/ui/sonner";
import './index.css';
import authStore from "@/services/auth/authStore";
import { ThemeProvider } from "@/components/ThemeProvider";
import AxiosInterceptor from "@/components/AxiosInterceptor";
import AppPageHeader from "@/components/AppPageHeader";
import Settings from "@/components/Settings";
import RequireActiveUser from "@/components/RequireActiveUser";
import { Verify } from "@/components/Verify";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireActiveUser loginFallbackPath="/login" inactiveFallbackPath="/verify">
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
