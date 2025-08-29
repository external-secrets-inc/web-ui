import { Status } from "@/components/workflows/Common.interfaces";
import { Consumer } from "@/components/workflows/Consumers/Consumers.interfaces";

export const MOCK_CONSUMERS: Consumer[] = [
  {
    id: "default/order-svc",
    name: "order-svc",
    namespace: "default",
    displayName: "Order Service",
    targetReference: { name: "vm-prod-a", namespace: "infra" },
    type: "Deployment",
    locations: [
      {
        name: "orders-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "db/orders", property: "username" },
      },
      {
        name: "orders-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "db/orders", property: "password" },
      },
    ],
    status: { phase: "Healthy" } as unknown as Status, // keep your real Status shape if you have it
  },
  {
    id: "payments/billing-api",
    name: "billing-api",
    namespace: "payments",
    displayName: "Billing API",
    targetReference: { name: "vm-prod-b", namespace: "infra" },
    type: "StatefulSet",
    locations: [
      {
        name: "billing-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "stripe/keys", property: "secret" },
      },
    ],
    status: { phase: "Degraded" } as unknown as Status,
  },
  {
    id: "observability/notify",
    name: "notify",
    namespace: "observability",
    displayName: "Notifications",
    targetReference: { name: "vm-staging", namespace: "observability" },
    type: "Deployment",
    locations: [
      {
        name: "notify-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "smtp/creds", property: "user" },
      },
      {
        name: "notify-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "smtp/creds", property: "pass" },
      },
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },
  {
    id: "not-observability/notify",
    name: "notify",
    namespace: "not-observability",
    displayName: "Notifications",
    targetReference: { name: "vm-staging", namespace: "not-observability" },
    type: "Deployment",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },

  // --- same namespace: default ---
  {
    id: "default/inventory-svc",
    name: "inventory-svc",
    namespace: "default",
    displayName: "Inventory Service",
    targetReference: { name: "vm-prod-a", namespace: "infra" }, // same target as default/order-svc
    type: "Deployment",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },
  {
    id: "default/gateway",
    name: "gateway",
    namespace: "default",
    displayName: "Edge Gateway",
    targetReference: { name: "vm-edge", namespace: "infra" }, // shared with payments/gateway below
    type: "Deployment",
    locations: [
      {
        name: "edge-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "edge/certs", property: "tls.crt" },
      },
      {
        name: "edge-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "edge/certs", property: "tls.key" },
      },
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },

  // --- same names across namespaces ---
  {
    id: "payments/order-svc",
    name: "order-svc", // same name as default/order-svc
    namespace: "payments",
    displayName: "Payments Order Mirror",
    targetReference: { name: "vm-prod-b", namespace: "infra" }, // different target
    type: "Deployment",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Degraded" } as unknown as Status,
  },
  {
    id: "payments/gateway",
    name: "gateway", // same name as default/gateway
    namespace: "payments",
    displayName: "Payments Gateway",
    targetReference: { name: "vm-edge", namespace: "infra" }, // same target as default/gateway
    type: "Deployment",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },
  {
    id: "qa/notify",
    name: "notify", // same name as observability/notify
    namespace: "qa",
    displayName: "QA Notifications",
    targetReference: { name: "vm-qa", namespace: "infra" },
    type: "Deployment",
    locations: [
      {
        name: "qa-notify-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "smtp/creds", property: "user" },
      },
      {
        name: "qa-notify-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "smtp/creds", property: "pass" },
      },
    ],
    status: { phase: "Unavailable" } as unknown as Status,
  },

  // --- infra namespace set ---
  {
    id: "infra/registry",
    name: "registry",
    namespace: "infra",
    displayName: "Container Registry",
    targetReference: { name: "vm-registry", namespace: "infra" },
    type: "StatefulSet",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },
  {
    id: "infra/runner",
    name: "runner",
    namespace: "infra",
    displayName: "CI Runner",
    targetReference: { name: "vm-registry", namespace: "infra" }, // same target as infra/registry
    type: "Deployment",
    locations: [
      {
        name: "ci-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "ci/runner", property: "token" },
      },
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },

  // --- staging / cross-target reuse ---
  {
    id: "staging/order-svc",
    name: "order-svc", // same name again, new namespace
    namespace: "staging",
    displayName: "Order Service (Staging)",
    targetReference: { name: "vm-staging", namespace: "observability" }, // same target name as observability/notify
    type: "Deployment",
    locations: [
      {
        name: "staging-orders-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "db/orders-staging", property: "dsn" },
      },
      {
        name: "staging-orders-store",
        apiVersion: "external-secrets.io/v1",
        kind: "SecretStore",
        remoteRef: { key: "thirdparty/api", property: "" }, // empty property to test renderer
      },
    ],
    status: { phase: "Degraded" } as unknown as Status,
  },

  // --- observability more in same namespace ---
  {
    id: "observability/metrics",
    name: "metrics",
    namespace: "observability",
    displayName: "Metrics Collector",
    targetReference: { name: "vm-staging", namespace: "observability" }, // same target as observability/notify
    type: "DaemonSet",
    locations: [
      {
          name: "go-studies",
          apiVersion: "target.external-secrets.io/v1alpha1",
          kind: "GithubRepository",
          remoteRef: {
              key: "README.md",
              property: "99:110"
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "andThenAnotherKey",
              property: ""
          },
      },
      {
          name: "fake",
          apiVersion: "external-secrets.io/v1",
          kind: "SecretStore",
          remoteRef: {
              key: "onemoreplus",
              property: ""
          },
      }
    ],
    status: { phase: "Healthy" } as unknown as Status,
  },
];
