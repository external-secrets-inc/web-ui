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
  PageSecretStores,
  PageSecretStoresCreate,
  PageWorkflowTemplates,
  PageWorkflowTemplatesCreate,
  PageWorkflowTemplateDetails,
  PageWorkflowRunTemplatesCreate,
  PageWorkflowGraphDemo,
  PageWorkflowRunDetails
} from "@/pages";
import authStore from "@/services/auth/authStore";
import RequireAuth from "@auth-kit/react-router/RequireAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode, useEffect } from "react";
import AuthProvider from "react-auth-kit";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  UIMatch,
} from "react-router-dom";
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
        handle: {
          breadcrumb: (match: UIMatch) => ({
            label: "Agents",
            path: match.pathname,
            navigatable: true,
          }),
        },
      },
      {
        path: "workflows",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <NavigateWithOrg to="workflows/secret-stores" replace />,
          },
          {
            path: "secret-stores",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Workflow Secret Stores",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageSecretStores />,
              },
              {
                path: "create",
                element: <PageSecretStoresCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Secret Store",
                    navigatable: false,
                  }),
                },
              },
            ],
          },
          {
            path: "templates",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Workflow Templates",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageWorkflowTemplates />,
              },
              {
                path: "create",
                element: <PageWorkflowTemplatesCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Workflow Template",
                    navigatable: false,
                  }),
                },
              },
              {
                path: ":templateNamespace/:templateName/runtemplates",
                element: <Outlet/>,
                handle: {
                  breadcrumb: (match: UIMatch) => ({
                    label: `${match.params.templateNamespace}/${match.params.templateName}`,
                    path: match.pathname,
                    navigatable: true,
                  }),
                },
                children: [
                  {
                    index: true,
                    element: <PageWorkflowTemplateDetails />,
                  },
                  {
                    path: "create",
                    element: <PageWorkflowRunTemplatesCreate />,
                    handle: {
                      breadcrumb: () => ({
                        label: "New Workflow Run Template",
                        navigatable: false,
                      }),
                    },
                  },
                  {
                    path: "runs/:workflowRunNamespace/:workflowRunName",
                    element: <PageWorkflowRunDetails />,
                    handle: {
                      breadcrumb: (match: UIMatch) => ({
                        label: `${match.params.workflowRunNamespace}/${match.params.workflowRunName}`,
                        navigatable: false,
                      }),
                    },
                  },
                ]
              },
            ],
          },
          {
            path: "graph-demo",
            element: <PageWorkflowGraphDemo />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Workflow Graph Demo",
                path: match.pathname,
                navigatable: true,
              }),
            },
          },
        ],
      },
      {
        path: "reloaders",
        element: <PageReloaders />,
        handle: {
          breadcrumb: (match: UIMatch) => ({
            label: "Reloaders",
            path: match.pathname,
            navigatable: true,
          }),
        },
      },
      {
        path: "audit",
        element: (
          <AuditProvider>
            <AuditGuard />
          </AuditProvider>
        ),
        children: [
          {
            index: true,
            element: <NavigateWithOrg to="audit/insights" replace />,
          },
          {
            path: "insights",
            element: <PageAuditInsights />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Insights",
                path: match.pathname,
                navigatable: true,
              }),
            },
          },
          {
            path: "providers",
            element: <PageAuditProviders />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Providers",
                path: match.pathname,
                navigatable: true,
              }),
            },
          },
          {
            path: "policies",
            element: <PageAuditPolicies />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Policies",
                path: match.pathname,
                navigatable: true,
              }),
            },
          },
          {
            path: "destinations",
            element: <PageAuditDestinations />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Destinations",
                path: match.pathname,
                navigatable: true,
              }),
            },
          },
        ],
      },
      {
        path: "settings",
        element: <PageSettings />,
        handle: {
          breadcrumb: (match: UIMatch) => ({
            label: "Settings",
            path: match.pathname,
            navigatable: true,
          }),
        },
      },
      // Smart redirects for unique child routes
      {
        path: "insights",
        element: <NavigateWithOrg to="audit/insights" replace />,
      },
      {
        path: "providers",
        element: <NavigateWithOrg to="audit/providers" replace />,
      },
      {
        path: "policies",
        element: <NavigateWithOrg to="audit/policies" replace />,
      },
      {
        path: "destinations",
        element: <NavigateWithOrg to="audit/destinations" replace />,
      },
      {
        path: "secret-stores",
        element: <NavigateWithOrg to="workflows/secret-stores" replace />,
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
