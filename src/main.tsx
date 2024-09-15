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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
    path: '/:org/agents',
    element: (
      <RequireAuth fallbackPath="/login">
        <ListAgents />
      </RequireAuth>
    ),
  },
  {
    path: '/not-found',
    element: <NotFound />, // Direct route to NotFound page
  },
  {
    path: '*',
    element: <NotFound />, // Catch-all for any undefined routes
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

