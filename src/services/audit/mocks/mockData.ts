// TODO: Either remove or use this mock as a "demo mode" when API is ready
export const mockProviderStats = [
  {
    kind: "aws",
    amount: 245,
    label: "AWS",
    tooltipLabel: "AWS Secrets Manager"
  },
  {
    kind: "gcp",
    amount: 156,
    label: "GCP",
    tooltipLabel: "Google Secret Manager"
  },
  {
    kind: "azure",
    amount: 98,
    label: "Azure",
    tooltipLabel: "Azure Key Vault"
  },
  {
    kind: "vault",
    amount: 45,
    label: "HashiCorp",
    tooltipLabel: "HashiCorp Vault"
  },
  {
    kind: "kubernetes",
    amount: 87,
    label: "K8s",
    tooltipLabel: "Kubernetes Secrets"
  },
  {
    kind: "onePassword",
    amount: 65,
    label: "1Pass",
    tooltipLabel: "1Password Connect"
  },
  {
    kind: "delinea",
    amount: 42,
    label: "Delinea",
    tooltipLabel: "Delinea Secret Server"
  },
  {
    kind: "conjur",
    amount: 23,
    label: "Conjur",
    tooltipLabel: "CyberArk Conjur"
  },
] as const

export const mockProblemStats = [
  {
    kind: "duplicated",
    amount: 4,
    label: "Duplicated",
    tooltipLabel: "Secrets with duplicate values"
  },
  {
    kind: "nonCompliant",
    amount: 18,
    label: "Non-compliant",
    tooltipLabel: "Secrets not following compliance rules"
  },
  {
    kind: "neverAccessed",
    amount: 5,
    label: "Never Accessed",
    tooltipLabel: "Secrets that were never accessed"
  },
] as const

export const mockTableData = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    secret: "Solid Serpent",
    lastRotation: "2024-06-03",
    policiesAmount: "3/4",
    fullCompliant: false, // 3/4 policies are compliant
    policies: [
      { name: "rotation-policy", status: "compliant" },
      { name: "encryption-policy", status: "compliant" },
      { name: "access-policy", status: "compliant" },
      { name: "naming-policy", status: "nonCompliant" }
    ],
    duplicatesAmount: 2,
    duplicates: [
      { provider: "aws", id: "arn:aws:secretsmanager:us-east-1:123456789012:secret:solid-serpent-1" },
      { provider: "gcp", id: "projects/123456789012/secrets/solid-serpent" }
    ],
    lastAccess: "2024-06-29",
    accessorsAmount: 2,
    accessors: [
      { name: "service-a", lastAccess: "2024-06-29" },
      { name: "service-b", lastAccess: "2024-06-28" }
    ]
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    secret: "Liquid Cobra",
    lastRotation: "2024-07-12",
    policiesAmount: "1/3",
    fullCompliant: false, // 1/3 policies are compliant
    policies: [
      { name: "rotation-policy", status: "nonCompliant" },
      { name: "encryption-policy", status: "executionError" },
      { name: "access-policy", status: "compliant" }
    ],
    duplicatesAmount: 0,
    duplicates: [],
    lastAccess: "2023-11-30",
    accessorsAmount: 2,
    accessors: [
      { name: "app-3", lastAccess: "2023-11-30" },
      { name: "app-4", lastAccess: "2023-11-29" }
    ]
  },
  {
    id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    secret: "Crying Wolf",
    lastRotation: "2024-04-20",
    policiesAmount: "0/0",
    fullCompliant: true, // 0/0 policies (empty array is considered fully compliant)
    policies: [],
    duplicatesAmount: 1,
    duplicates: [
      { provider: "kubernetes", id: "default/crying-wolf" }
    ],
    lastAccess: "2024-02-01",
    accessorsAmount: 1,
    accessors: [
      { name: "pod-1", lastAccess: "2024-02-01" }
    ]
  },
  {
    id: "6ba7b816-9dad-11d1-80b4-00c04fd430c8",
    secret: "Raging Raven",
    lastRotation: "2024-03-31",
    policiesAmount: "3/4",
    fullCompliant: false, // 3/4 policies are compliant
    policies: [
      { name: "rotation-policy", status: "compliant" },
      { name: "encryption-policy", status: "compliant" },
      { name: "access-policy", status: "compliant" },
      { name: "naming-policy", status: "nonCompliant" }
    ],
    duplicatesAmount: 2,
    duplicates: [
      { provider: "aws", id: "arn:aws:secretsmanager:us-east-1:123456789012:secret:raging-raven-1" },
      { provider: "gcp", id: "projects/123456789012/secrets/raging-raven" }
    ],
    lastAccess: "2024-09-11",
    accessorsAmount: 2,
    accessors: [
      { name: "service-a", lastAccess: "2024-09-11" },
      { name: "service-b", lastAccess: "2024-09-10" }
    ]
  },
  {
    id: "6ba7b818-9dad-11d1-80b4-00c04fd430c8",
    secret: "Screaming Mantis",
    lastRotation: "2023-12-25",
    policiesAmount: "3/3",
    fullCompliant: true, // 3/3 policies are compliant
    policies: [
      { name: "rotation-policy", status: "compliant" },
      { name: "encryption-policy", status: "compliant" },
      { name: "access-policy", status: "compliant" }
    ],
    duplicatesAmount: 2,
    duplicates: [
      { provider: "azure", id: "https://my-vault.vault.azure.net/secrets/screaming-mantis" },
      { provider: "vault", id: "secret/data/screaming-mantis" }
    ],
    lastAccess: "2024-01-15",
    accessorsAmount: 2,
    accessors: [
      { name: "app-1", lastAccess: "2024-01-15" },
      { name: "app-2", lastAccess: "2024-01-14" }
    ]
  },
] as const

export const mockNetworkResponseDelay = () => new Promise(resolve => setTimeout(resolve, 2500))
