import { AuditProvider } from "@/components/Audit/AuditContext";
import { AuditGuard } from "@/components/Audit/AuditGuard";
import {
  AuthForgotPassword,
  AuthLayout,
  AuthLogin,
  AuthRedirectGuard,
  AuthResetPassword,
  AuthSignup,
  AuthVerify,
} from "@/components/Auth";
import BodyPortal from "@/components/BodyPortal";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import RequireActiveUser from "@/components/RequireActiveUser";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IS_DEV, IS_PROD } from "@/constants";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  PageAgents,
  PageAuditInsights,
  PageAuditDestinations,
  PageAuditPolicies,
  PageAuditProviders,
  PageReloaders,
  PageSettings,
} from "@/pages";
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

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireActiveUser
        loginFallbackPath="/login"
        inactiveFallbackPath="/verify"
      >
        <NavigateWithOrg to="/agents" replace />
      </RequireActiveUser>
    ),
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <AuthRedirectGuard />,
        children: [
          { path: "/signup", element: <AuthSignup /> },
          { path: "/login", element: <AuthLogin /> },
        ],
      },
      {
        path: "/verify",
        element: (
          <RequireAuth fallbackPath="/login">
            <AuthVerify />
          </RequireAuth>
        ),
      },
      { path: "/forgot-password", element: <AuthForgotPassword /> },
      { path: "/reset-password", element: <AuthResetPassword /> },
    ],
  },
  {
    path: "/:org",
    element: <App />,
    children: [
      {
        path: "",
        element: <NavigateWithOrg to="/agents" replace />,
      },
      {
        path: "agents",
        element: <PageAgents />,
      },
      {
        path: "reloaders",
        element: <PageReloaders />,
      },
      {
        element: (
          <AuditProvider>
            <AuditGuard />
          </AuditProvider>
        ),
        children: [
          {
            path: "audit/insights",
            element: <PageAuditInsights />,
          },
          {
            path: "audit/providers",
            element: <PageAuditProviders />,
          },
          {
            path: "audit/policies",
            element: <PageAuditPolicies />,
          },
          {
            path: "audit/destinations",
            element: <PageAuditDestinations />,
          },
          {
            path: "audit",
            element: <NavigateWithOrg to="/audit/insights" replace />,
          },
        ],
      },
      {
        path: "settings",
        element: <PageSettings />,
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
            {IS_DEV && (
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
