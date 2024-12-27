/**
 * Mock API Response Structures
 * These represent the exact format we expect from the backend
 */
type StatsItem = {
  kind: string
  label: string
  tooltipLabel: string
  amount: number
}

type TimelineData = {
  date: string
  stats: StatsItem[]
}

// Helper functions (internal use only)
// Random number but seeded for consistent mock data
const seededRandom = (date: string) => {
  let seed = Array.from(date).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const mockProviderStats: StatsItem[] = [
  { kind: "aws", label: "AWS", tooltipLabel: "AWS Secrets Manager", amount: 245 },
  { kind: "gcp", label: "GCP", tooltipLabel: "Google Secret Manager", amount: 156 },
  { kind: "azure", label: "Azure", tooltipLabel: "Azure Key Vault", amount: 98 },
  { kind: "vault", label: "HashiCorp", tooltipLabel: "HashiCorp Vault", amount: 45 },
  { kind: "kubernetes", label: "K8s", tooltipLabel: "Kubernetes Secrets", amount: 87 },
  { kind: "onePassword", label: "1Pass", tooltipLabel: "1Password Connect", amount: 65 },
  { kind: "delinea", label: "Delinea", tooltipLabel: "Delinea Secret Server", amount: 42 },
  { kind: "conjur", label: "Conjur", tooltipLabel: "CyberArk Conjur", amount: 23 }
]

export const mockProblemStats: StatsItem[] = [
  { kind: "duplicated", label: "Duplicated", tooltipLabel: "Secrets with duplicate values", amount: 4 },
  { kind: "nonCompliant", label: "Non-compliant", tooltipLabel: "Secrets not following compliance rules", amount: 18 },
  { kind: "neverAccessed", label: "Never Accessed", tooltipLabel: "Secrets that were never accessed", amount: 5 }
]

const generateMockTimelineData = (startDate: Date | string, endDate: Date | string, baseStats: StatsItem[]): TimelineData[] => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(start)
    date.setDate(date.getDate() + index)
    const dateStr = date.toISOString().split('T')[0]

    return {
      date: dateStr,
      stats: baseStats.map(stat => ({
        ...stat,
        amount: stat.amount - Math.floor(seededRandom(dateStr + stat.kind) * (stat.amount * 0.2))
      }))
    }
  })
}

// Timeline mock generators
export const getMockProviderTimelineStats = (startDate: string, endDate: string) =>
  generateMockTimelineData(new Date(startDate), new Date(endDate), mockProviderStats)

export const getMockProblemTimelineStats = (startDate: string, endDate: string) =>
  generateMockTimelineData(new Date(startDate), new Date(endDate), mockProblemStats)

export const mockLastUpdate = new Date().toLocaleString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const mockAuditTableData = {
  secretsData: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Solid Serpent",
      provider: "550e8400-e29b-41d4-a716-446655440001",
      providerName: "aws",
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
      name: "Liquid Cobra",
      provider: "6ba7b812-9dad-11d1-80b4-00c04fd430c1",
      providerName: "gcp",
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
      name: "Crying Wolf",
      provider: "6ba7b814-9dad-11d1-80b4-00c04fd430c1",
      providerName: "kubernetes",
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
      name: "Raging Raven",
      provider: "6ba7b816-9dad-11d1-80b4-00c04fd430c1",
      providerName: "azure",
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
      name: "Screaming Mantis",
      provider: "6ba7b818-9dad-11d1-80b4-00c04fd430c1",
      providerName: "vault",
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
  ],
  secretsNames: [
    { value: "Solid Serpent", label: "Solid Serpent" },
    { value: "Liquid Cobra", label: "Liquid Cobra" },
    { value: "Crying Wolf", label: "Crying Wolf" },
    { value: "Raging Raven", label: "Raging Raven" },
    { value: "Screaming Mantis", label: "Screaming Mantis" },
  ],
  policiesNames: [
    { value: "rotation-policy", label: "rotation-policy" },
    { value: "encryption-policy", label: "encryption-policy" },
    { value: "access-policy", label: "access-policy" },
    { value: "naming-policy", label: "naming-policy" },
  ],
  providers: [
    { value: "aws", label: "aws" },
    { value: "gcp", label: "gcp" },
    { value: "kubernetes", label: "kubernetes" },
    { value: "azure", label: "azure" },
    { value: "vault", label: "vault" },
  ]
} as const

export const mockPoliciesData = [
  {
    policyID: "policy-id-1",
    tenantID: "tenant-1",
    name: "Policy 1",
    executeOn: [
      "Read",
      "UpdatePreHash",
      "UpdatePostHash",
      "*",
    ],
    executeOnAmount: 4,
    providers: {
      amount: 1,
      items: [
        { providerID: "provider-1" }
      ]
    },
    engine: "rego",
    rule: "cGFja2FnZSBtYWluCmFsbG93IHsgaW5wdXQudXNlciA9PSAiYWRtaW4iIH0=",
  },
  {
    policyID: "policy-id-2",
    tenantID: "tenant-2",
    name: "Policy 2",
    executeOn: [
      "Read",
      "UpdatePreHash",
      "UpdatePostHash",
      "Create",
    ],
    executeOnAmount: 4,
    providers: {
      amount: 2,
      items: [
        { providerID: "provider-1" },
        { providerID: "provider-2" }
      ]
    },
    engine: "rego",
    rule: "cGFja2FnZSBtYWluCmFsbG93IHsgaW5wdXQudXNlciA9PSAiYWRtaW4iIH0=",
  },
  {
    policyID: "policy-id-3",
    tenantID: "tenant-3",
    name: "Policy 3",
    executeOn: [
      "Delete",
      "RBACCreate",
      "RBACUpdate",
      "RBACDelete",
      "*",
    ],
    executeOnAmount: 5,
    providers: {
      amount: 3,
      items: [
        { providerID: "provider-1" },
        { providerID: "provider-2" },
        { providerID: "provider-3" }
      ]
    },
    engine: "rego",
    rule: "cGFja2FnZSBtYWluCmFsbG93IHsgaW5wdXQudXNlciA9PSAiYWRtaW4iIH0=",
  },
  {
    policyID: "policy-id-4",
    tenantID: "tenant-4",
    name: "Policy 4",
    executeOn: [
      "Read",
      "UpdatePreHash",
    ],
    executeOnAmount: 2,
    providers: {
      amount: 0,
      items: []
    },
    engine: "rego",
    rule: "cGFja2FnZSBtYWluCmFsbG93IHsgaW5wdXQudXNlciA9PSAiYWRtaW4iIH0=",
  },
] as const

export const mockProvidersData = [
  {
    id: "id-1",
    providerID: "provider-id-1",
    name: "Provider 1",
    backendType: "GCP",
  },
  {
    id: "id-2",
    providerID: "provider-id-2",
    name: "Provider 2",
    backendType: "Azure",
  },
  {
    id: "id-3",
    providerID: "provider-id-3",
    name: "Provider 3",
    backendType: "AWS",
  },
] as const

export const mockNetworkResponseDelay = () => new Promise(resolve => setTimeout(resolve, 2500))
