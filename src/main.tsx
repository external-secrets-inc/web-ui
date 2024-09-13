
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Home } from "./components/Home";
import { NotFound } from "./components/NotFound";
import { ListAgents } from "./components/agents/ListAgents";
import { Toaster } from "@/components/ui/sonner"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/agents',
    element: <ListAgents />,
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
