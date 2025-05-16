import ListAgents from "@/components/agents/ListAgents";
import AppPageHeader from "@/components/AppPageHeader";
import AuditWrapper from "@/components/audit/AuditWrapper";
import {
  AuthForgotPassword,
  AuthLayout,
  AuthLogin,
  AuthRedirectGuard,
  AuthResetPassword,
  AuthSignup,
} from "@/components/Auth";
import AxiosInterceptor from "@/components/AxiosInterceptor";
import BodyPortal from "@/components/BodyPortal";
import NavigateWithOrg from "@/components/NavigateWithOrg";
import { NotFound } from "@/components/NotFound";
import RequireActiveUser from "@/components/RequireActiveUser";
import ListRotators from "@/components/rotators/ListRotators";
import Settings from "@/components/Settings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Loader } from "@/components/ui/Loader";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Verify } from "@/components/Verify";
import { DOCS_DOMAIN, IS_PROD } from "@/constants";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { LayoutProvider } from "@/context/LayoutContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import authStore from "@/services/auth/authStore";
import RequireAuth from "@auth-kit/react-router/RequireAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode, Suspense, useEffect } from "react";
import AuthProvider from "react-auth-kit";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { load, page } from "./analytics";
import App from "./App";
import OrgRedirector from "./components/OrgRedirector";
import "./index.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireActiveUser loginFallbackPath="/login" inactiveFallbackPath="/verify">
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
    element: <AuthLayout />,
    children: [
      {
        element: <AuthRedirectGuard />,
        children: [
          { path: "/signup", element: <AuthSignup /> },
          { path: "/login", element: <AuthLogin /> },
        ],
      },
      { path: "/forgot-password", element: <AuthForgotPassword /> },
      { path: "/reset-password", element: <AuthResetPassword /> },
    ],
  },
  {
    path: "/:org",
    element: (
      <AxiosInterceptor>
        <RequireActiveUser loginFallbackPath="/login" inactiveFallbackPath="/verify">
          <OrgRedirector>
            <SubscriptionProvider>
              <FeatureFlagProvider>
                <App />
              </FeatureFlagProvider>
            </SubscriptionProvider>
          </OrgRedirector>
        </RequireActiveUser>
      </AxiosInterceptor>
    ),
    children: [
      {
        path: "",
        element: <NavigateWithOrg to="/agents" replace />,
      },
      {
        path: "agents",
        element: (
          <>
            <AppPageHeader
              title="Your Agents"
              description={
                <>
                  Agents deploy, maintain, and configure External Secrets Operator installations for you<br />
                  See our <a href={`${DOCS_DOMAIN}/docs/esi-agent/quickstart`}>Quickstart guide</a> and <a href={`${DOCS_DOMAIN}/docs/esi-for-eso/quickstart`}>Exclusive Features</a> for more details
                </>
              }
            />
            <ListAgents />
          </>
        ),
      },
      {
        path: "rotators",
        element: (
          <>
            <AppPageHeader
              title="Your Async Rotators"
              description={
                <>
                  Async rotators listen for events from audit logs to trigger a rotation in the External Secrets Operator<br />
                  See our <a href={`${DOCS_DOMAIN}/docs/esi-async-rotator/quickstart`}>Quickstart guide</a> for more details
                </>
              }
            />
            <ListRotators />
          </>
        ),
      },
      // TODO: Remove mock variable when audit is ready https://github.com/external-secrets-inc/web-ui/issues/124
      import.meta.env.VITE_MOCK_AUDIT_ROUTE ? {
        path: 'audit',
        element: (
          <>
            <AppPageHeader
              title="Audit"
              description={
                <>
                  Gather insights about your secrets and policies based on audit logs from multiple providers<br />
                  {/* TODO:  add link to quickstart guide*/}
                </>
              }
            />
            <Suspense fallback={<Loader/>}>
              <AuditWrapper />
            </Suspense>
          </>
        )
      } : {},
      {
        path: "settings",
        element: (
          <>
            <AppPageHeader
              title="Settings"
              description="Manage your account settings and preferences"
            />
            <Settings />
          </>
        ),
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
              <LayoutProvider>
                <Main />
                <Toaster />
              </LayoutProvider>
            </TooltipProvider>
            {!IS_PROD && (
              <BodyPortal>
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" position="left" />
              </BodyPortal>
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>
  );
}
