import { ListAgents } from "@/components/agents/ListAgents";
import Auth from "@/components/Auth";
import { NotFound } from "@/components/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from '@/components/ui/sonner';
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import * as React from "react";
import AuthProvider from 'react-auth-kit';
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import authStore from "./services/auth/authStore";

// TODO: We gotta have tenant-based URL auto-routing and authorization
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/agents" replace />,
  },
  {
    path: '/signup',
    element: <Auth variant="signup" />,
  },
  {
    path: '/login',
    element: <Auth variant="login" />,
  },
  {
    path: '/agents',
    element: (
      <RequireAuth fallbackPath="/signup">
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
