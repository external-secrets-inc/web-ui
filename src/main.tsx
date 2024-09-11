// main.tsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthProvider  from 'react-auth-kit';
import RequireAuth from '@auth-kit/react-router/RequireAuth';
import './index.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Home } from "@/components/Home";
import { NotFound } from "@/components/NotFound";
import Auth from "@/components/Auth";
import authStore from "./services/auth/authStore";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth fallbackPath="/login">
        <Home />
      </RequireAuth>
    ),
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