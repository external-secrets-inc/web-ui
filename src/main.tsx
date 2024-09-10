import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Home } from "./components/Home";
import { NotFound } from "./components/NotFound";
import Auth from "./components/Auth";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
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
      <ThemeProvider storageKey="ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </React.StrictMode>
  );
}