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
  PageAuditDestinations,
  PageAuditInsights,
  PageAuditPolicies,
  PageAuditProviders,
  PageAuthorizationDetails,
  PageAuthorizations,
  PageAuthorizationsCreate,
  PageConsumers,
  PageFederations,
  PageFederationsCreate,
  PageFindingDetails,
  PageFindings,
  PageGeneratorDetails,
  PageGenerators,
  PageGeneratorsCreate,
  PageReloaders,
  PageSecrets,
  PageSecretsCreate,
  PageSecretStores,
  PageSecretStoresCreate,
  PageSecretStoresEdit,
  PageServiceAccounts,
  PageServiceAccountsCreate,
  PageSettings,
  PageTargets,
  PageTargetsCreate,
  PageWorkflowRunDetails,
  PageWorkflowRunTemplatesCreate,
  PageWorkflowTemplateDetails,
  PageWorkflowTemplates,
  PageWorkflowTemplatesCreate,
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
  type Location,
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
        <NavigateWithOrg to="/operations/agents" replace />
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
        element: <NavigateWithOrg to="/operations/agents" replace />,
      },
      {
        path: "operations",
        element: <Outlet />,
        handle: {
          breadcrumb: () => ({
            label: "Operations",
            navigatable: false,
          }),
        },
        children: [
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
        ],
      },
      // Backwards compatibility redirects for old operations URLs
      {
        path: "agents",
        element: <NavigateWithOrg to="/operations/agents" replace />,
      },
      {
        path: "automation",
        element: <Outlet />,
        handle: {
          breadcrumb: () => ({
            label: "Automation",
            navigatable: false,
          }),
        },
        children: [
          {
            index: true,
            element: <NavigateWithOrg to="automation/workflows" replace />,
          },
          {
            path: "workflows",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Workflows",
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
                    label: "New Workflow",
                    navigatable: false,
                  }),
                },
              },
              {
                path: ":templateNamespace/:templateName",
                element: <Outlet />,
                handle: {
                  breadcrumb: (match: UIMatch) => ({
                    label: `${match.params.templateName}`,
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
                        label: "New Run Template",
                        navigatable: false,
                      }),
                    },
                  },
                  {
                    path: "runs/:workflowRunNamespace/:workflowRunName",
                    element: <PageWorkflowRunDetails />,
                    handle: {
                      breadcrumb: (match: UIMatch) => ({
                        label: `${match.params.workflowRunName}`,
                        navigatable: false,
                      }),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      // New Resources section
      {
        path: "resources",
        element: <Outlet />,
        handle: {
          breadcrumb: () => ({
            label: "Resources",
            navigatable: false,
          }),
        },
        children: [
          {
            path: "secrets",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Secrets",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageSecrets />,
              },
              {
                path: "create",
                element: <PageSecretsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Secret",
                    navigatable: false,
                  }),
                },
              },
            ],
          },
          {
            path: "service-accounts",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Service Accounts",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageServiceAccounts />,
              },
              {
                path: "create",
                element: <PageServiceAccountsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Service Account",
                    navigatable: false,
                  }),
                },
              },
            ],
          },
          {
            path: "secret-stores",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Secret Stores",
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
              {
                path: "edit/:secretstoreNamespace/:secretstoreName",
                element: <PageSecretStoresEdit />,
                handle: {
                  breadcrumb: (match: UIMatch) => ({
                    label: `${match.params.secretstoreName}`,
                    path: match.pathname,
                    navigatable: true,
                  }),
                },
              },
            ],
          },
          {
            path: "generators",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Generators",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageGenerators />,
              },
              {
                path: "create",
                element: <PageGeneratorsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Generator",
                    navigatable: false,
                  }),
                },
              },
              {
                path: ":generatorKind/:generatorNamespace/:generatorName",
                element: <PageGeneratorDetails />,
                handle: {
                  breadcrumb: (match: UIMatch) => ({
                    label: `${match.params.generatorName}`,
                    path: match.pathname,
                    navigatable: true,
                  }),
                },
              },
            ],
          },
          {
            path: "targets",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Targets",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageTargets />,
              },
              {
                path: "create",
                element: <PageTargetsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Target",
                    navigatable: false,
                  }),
                },
              },
            ],
          },
        ],
      },
      // Backwards compatibility redirects for old resource URLs under workflows
      // TODO[cfviotti]: Remove these when we properly update the docs AND the direct links on the UI (we really should have a better way to avoid breaking links when such refactors are necessary)
      {
        path: "workflows/secrets",
        element: <NavigateWithOrg to="resources/secrets" replace />,
      },
      {
        path: "workflows/secrets/create",
        element: <NavigateWithOrg to="resources/secrets/create" replace />,
      },
      {
        path: "workflows/service-accounts",
        element: <NavigateWithOrg to="resources/service-accounts" replace />,
      },
      {
        path: "workflows/service-accounts/create",
        element: (
          <NavigateWithOrg to="resources/service-accounts/create" replace />
        ),
      },
      {
        path: "workflows/secret-stores",
        element: <NavigateWithOrg to="resources/secret-stores" replace />,
      },
      {
        path: "workflows/secret-stores/create",
        element: (
          <NavigateWithOrg to="resources/secret-stores/create" replace />
        ),
      },
      {
        path: "workflows/secret-stores/edit/:secretstoreNamespace/:secretstoreName",
        element: (
          <NavigateWithOrg
            to="resources/secret-stores/edit/:secretstoreNamespace/:secretstoreName"
            replace
          />
        ),
      },
      {
        path: "workflows/generators",
        element: <NavigateWithOrg to="resources/generators" replace />,
      },
      {
        path: "workflows/generators/create",
        element: <NavigateWithOrg to="resources/generators/create" replace />,
      },
      {
        path: "workflows/generators/:generatorKind/:generatorNamespace/:generatorName",
        element: (
          <NavigateWithOrg
            to="resources/generators/:generatorKind/:generatorNamespace/:generatorName"
            replace
          />
        ),
      },
      // Backwards compatibility redirects for old Workflows (previously under /workflows/templates)
      {
        path: "workflows",
        element: <NavigateWithOrg to="automation/workflows" replace />,
      },
      {
        path: "workflows/templates",
        element: <NavigateWithOrg to="automation/workflows" replace />,
      },
      {
        path: "workflows/templates/create",
        element: <NavigateWithOrg to="automation/workflows/create" replace />,
      },
      {
        path: "workflows/templates/:templateNamespace/:templateName",
        element: (
          <NavigateWithOrg
            to="automation/workflows/:templateNamespace/:templateName"
            replace
          />
        ),
      },
      {
        path: "workflows/templates/:templateNamespace/:templateName/create",
        element: (
          <NavigateWithOrg
            to="automation/workflows/:templateNamespace/:templateName/create"
            replace
          />
        ),
      },
      {
        path: "workflows/templates/:templateNamespace/:templateName/runs/:workflowRunNamespace/:workflowRunName",
        element: (
          <NavigateWithOrg
            to="automation/workflows/:templateNamespace/:templateName/runs/:workflowRunNamespace/:workflowRunName"
            replace
          />
        ),
      },
      {
        path: "findings",
        element: <Outlet />,
        handle: {
          breadcrumb: () => ({
            label: "Findings",
            navigatable: false,
          }),
        },
        children: [
          {
            path: "reused-secrets",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Reused Secrets",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageFindings />,
              },
              {
                path: ":findingNamespace/:findingName",
                element: <PageFindingDetails />,
                handle: {
                  breadcrumb: (
                    match: UIMatch,
                    location: Location
                  ) => {
                    if (location.state?.dominantKey) {
                      return {
                        label: location.state.dominantKey,
                        path: match.pathname,
                        navigatable: true,
                      };
                    }

                    // Fallback to URL params if no state
                    const findingName = match.params.findingName ?? "";
                    return {
                      label: findingName,
                      path: match.pathname,
                      navigatable: true,
                    };
                  },
                },
              },
            ],
          },
          {
            path: "consumers",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Consumers",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageConsumers />,
              },
            ],
          },
        ],
      },
      {
        path: "federation",
        element: <Outlet />,
        handle: {
          breadcrumb: () => ({
            label: "Federation",
            navigatable: false,
          }),
        },
        children: [
          {
            index: true,
            element: <NavigateWithOrg to="federation/identity-providers" replace />,
          },
          {
            path: "identity-providers",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Identity Providers",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageFederations />,
              },
              {
                path: "create",
                element: <PageFederationsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Identity Provider",
                    navigatable: false,
                  }),
                },
              },
            ],
          },
          {
            path: "authorizations",
            element: <Outlet />,
            handle: {
              breadcrumb: (match: UIMatch) => ({
                label: "Authorizations",
                path: match.pathname,
                navigatable: true,
              }),
            },
            children: [
              {
                index: true,
                element: <PageAuthorizations />,
              },
              {
                path: "create",
                element: <PageAuthorizationsCreate />,
                handle: {
                  breadcrumb: () => ({
                    label: "New Authorization",
                    navigatable: false,
                  }),
                },
              },
              {
                path: ":authorizationNamespace/:authorizationName",
                element: <PageAuthorizationDetails />,
                handle: {
                  breadcrumb: (match: UIMatch) => ({
                    label: `${match.params.authorizationName}`,
                    path: match.pathname,
                    navigatable: true,
                  }),
                },
              },
            ],
          }
        ]
      },
      {
        path: "reloaders",
        element: <NavigateWithOrg to="/operations/reloaders" replace />,
      },
      {
        path: "audit",
        element: (
          <AuditProvider>
            <AuditGuard />
          </AuditProvider>
        ),
        handle: {
          breadcrumb: () => ({
            label: "Audit",
            navigatable: false,
          }),
        },
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
        element: <NavigateWithOrg to="resources/secret-stores" replace />,
      },
      {
        path: "generators",
        element: <NavigateWithOrg to="resources/generators" replace />,
      },
      {
        path: "findings",
        element: <NavigateWithOrg to="/findings" replace />,
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
