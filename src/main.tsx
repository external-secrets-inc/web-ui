import { ListAgents } from "@/components/agents/ListAgents";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from '@/components/ui/sonner';
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import * as React from "react";
import AuthProvider from 'react-auth-kit';
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import authStore from "./services/auth/authStore";

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
    path: '/:org/agents',
    element: (
      <RequireAuth fallbackPath="/login">
        <ListAgents />
      </RequireAuth>
    ),
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

