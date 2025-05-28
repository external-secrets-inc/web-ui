import { AuditProvider } from "@/components/Audit/AuditContext";
import { AuditGuard } from "@/components/Audit/AuditGuard";
import { AuditMockProvider } from "@/components/Audit/AuditMockContext";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import ResetPassword from "@/components/Auth/ResetPassword";
import BodyPortal from "@/components/BodyPortal";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import RequireActiveUser from "@/components/RequireActiveUser";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Verify } from "@/components/Verify";
import { IS_PROD } from "@/constants";
import { ThemeProvider } from "@/context/ThemeContext";
import authStore from "@/services/auth/authStore";
import RequireAuth from "@auth-kit/react-router/RequireAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode, useEffect } from "react";
import AuthProvider from "react-auth-kit";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { load, page } from "./analytics";
import { App } from "./App";
import "./index.css";
import { AgentsPage } from "./pages/AgentsPage";
import { AuditDashboardPage } from "./pages/AuditDashboardPage";
import { AuditDestinationsPage } from "./pages/AuditDestinationsPage";
import { AuditPoliciesPage } from "./pages/AuditPoliciesPage";
import { AuditProvidersPage } from "./pages/AuditProvidersPage";
import { ReloadersPage } from "./pages/ReloadersPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireActiveUser
        loginFallbackPath="/signup"
        inactiveFallbackPath="/verify"
      >
        <NavigateWithOrg to="/agents" replace />
      </RequireActiveUser>
    ),
  },
  {
    path: "/verify",
    element: (
      <RequireAuth fallbackPath="/login">
        <Verify />
      </RequireAuth>
    ),
  },
  {
    path: "/signup",
    element: <NavigateWithOrg to="/agents" fallbackToSignup replace />,
  },
  {
    path: "/login",
    element: <NavigateWithOrg to="/agents" fallbackToLogin replace />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/:org",
    element: <App />,
    children: [
      {
        path: "",
        element: <NavigateWithOrg to="/audit/dashboard" replace />,
      },
      {
        path: "agents",
        element: <AgentsPage />,
      },
      {
        path: "rotators",
        element: <ReloadersPage />,
      },
      {
        element: (
          <AuditMockProvider>
            <AuditProvider>
              <AuditGuard />
            </AuditProvider>
          </AuditMockProvider>
        ),
        children: [
          {
            path: "audit/dashboard",
            element: <AuditDashboardPage />,
          },
          {
            path: "audit/providers",
            element: <AuditProvidersPage />,
          },
          {
            path: "audit/policies",
            element: <AuditPoliciesPage />,
          },
          {
            path: "audit/destinations",
            element: <AuditDestinationsPage />,
          },
          {
            path: "audit",
            element: <NavigateWithOrg to="/audit/dashboard" replace />,
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const Main = () => {
  useEffect(() => {
    if (IS_PROD) {
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

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider store={authStore}>
        <ThemeProvider storageKey="ui-theme">
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={300} skipDelayDuration={300}>
              <Main />
              <Toaster />
            </TooltipProvider>
            {IS_PROD && (
              <BodyPortal>
                <ReactQueryDevtools
                  initialIsOpen={false}
                  buttonPosition="bottom-right"
                  position="right"
                />
              </BodyPortal>
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>
  );
}
