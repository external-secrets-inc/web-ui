import { AuditSecretData, AuditSecretTableData } from "@/components/audit/Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";

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

export const mockLastUpdate = formatDate(new Date(), { format: 'readableDate' });

export const mockAuditSecretTableData: AuditSecretTableData[] = [
  {
    id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
    name: "Solid Serpent",
    provider: "e45c3621-5e2f-4996-91c8-9dec1a15f5fb",
    providerName: "AWS Secrets Manager",
    lastRotation: null,
    compliantPoliciesAmount: 3,
    policiesAmount: 4,
    fullCompliant: false,
    duplicatesAmount: 2,
    lastAccess: "2024-06-29T12:00:00Z",
    accessorsAmount: 2,
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    name: "Liquid Cobra",
    provider: "2a7b4de8-31c9-45d2-b656-92c8f6947f9d",
    providerName: "GCP Secret Manager",
    lastRotation: "2024-07-12T12:00:00Z",
    compliantPoliciesAmount: 1,
    policiesAmount: 3,
    fullCompliant: false,
    duplicatesAmount: 0,
    lastAccess: "2023-11-30T12:00:00Z",
    accessorsAmount: 2,
  },
  {
    id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    name: "Crying Wolf",
    provider: "7f9e8d23-6c5b-4a3e-9f72-14d5a8b67c91",
    providerName: "Kubernetes Secrets",
    lastRotation: "2024-04-20T12:00:00Z",
    compliantPoliciesAmount: 0,
    policiesAmount: 0,
    fullCompliant: true,
    duplicatesAmount: 1,
    lastAccess: "2024-02-01T12:00:00Z",
    accessorsAmount: 1,
  },
  {
    id: "7h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w",
    name: "Raging Raven",
    provider: "b3c2d1a4-8f7e-4d6c-9b5a-3e2f1c8d7b6a",
    providerName: "Azure Key Vault",
    lastRotation: "2024-03-31T12:00:00Z",
    compliantPoliciesAmount: 3,
    policiesAmount: 4,
    fullCompliant: false,
    duplicatesAmount: 2,
    lastAccess: "2024-09-11T12:00:00Z",
    accessorsAmount: 2,
  },
  {
    id: "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    name: "Screaming Mantis",
    provider: "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    providerName: "HashiCorp Vault",
    lastRotation: "2023-12-25T12:00:00Z",
    compliantPoliciesAmount: 3,
    policiesAmount: 3,
    fullCompliant: true,
    duplicatesAmount: 2,
    lastAccess: "2024-01-15T12:00:00Z",
    accessorsAmount: 2,
  },
];

export const mockAuditSecretsData: AuditSecretData[] = [
  {
    id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
    name: "Solid Serpent",
    providerID: "e45c3621-5e2f-4996-91c8-9dec1a15f5fb",
    providerName: "AWS Secrets Manager",
    duplicates: [
      {
        id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
        name: "Liquid Cobra",
        providerID: "2a7b4de8-31c9-45d2-b656-92c8f6947f9d",
        providerName: "GCP Secret Manager",
      },
      {
        id: "7h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w",
        name: "Raging Raven",
        providerID: "b3c2d1a4-8f7e-4d6c-9b5a-3e2f1c8d7b6a",
        providerName: "Azure Key Vault",
      },
    ],
    accessors: [
      {
        id: "17f77a29-9492-4123-8af3-13accf58a003",
        name: "service-account-1",
        accessTime: "2024-06-29T12:00:00Z",
      },
      {
        id: "89058f3c-8032-4585-94bd-c1473b11ae76",
        name: "service-account-2",
        accessTime: "2024-06-28T12:00:00Z",
      },
    ],
    policies: [
      { id: "da782198-fdfd-4d35-b6dd-7d8427b43a79", name: "rotation-policy", status: "compliant" },
      { id: "8d966424-3201-46d8-96aa-0efa1db60d03", name: "encryption-policy", status: "compliant" },
      { id: "7a966424-3201-46d8-96aa-0efa1db60d04", name: "access-policy", status: "compliant" },
      { id: "6b966424-3201-46d8-96aa-0efa1db60d05", name: "naming-policy", status: "non_compliant" },
    ],
    lastAccess: "2024-06-29T12:00:00Z",
    lastRotation: null,
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    name: "Liquid Cobra",
    providerID: "2a7b4de8-31c9-45d2-b656-92c8f6947f9d",
    providerName: "GCP Secret Manager",
    duplicates: [],
    accessors: [
      {
        id: "b702dbf9-8176-4011-9f90-07b26f5eaab3",
        name: "app-service-3",
        accessTime: "2023-11-30T12:00:00Z",
      },
      {
        id: "c813ecfa-9287-5122-af01-18c37f6fbbcc",
        name: "app-service-4",
        accessTime: "2023-11-29T12:00:00Z",
      },
    ],
    policies: [
      { id: "da782198-fdfd-4d35-b6dd-7d8427b43a80", name: "rotation-policy", status: "non_compliant" },
      { id: "8d966424-3201-46d8-96aa-0efa1db60d06", name: "encryption-policy", status: "error" },
      { id: "7a966424-3201-46d8-96aa-0efa1db60d07", name: "access-policy", status: "compliant" },
    ],
    lastAccess: "2023-11-30T12:00:00Z",
    lastRotation: "2024-07-12T12:00:00Z",
  },
  {
    id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    name: "Crying Wolf",
    providerID: "7f9e8d23-6c5b-4a3e-9f72-14d5a8b67c91",
    providerName: "Kubernetes Secrets",
    duplicates: [
      {
        id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        name: "Solid Serpent",
        providerID: "e45c3621-5e2f-4996-91c8-9dec1a15f5fb",
        providerName: "AWS Secrets Manager",
      },
    ],
    accessors: [
      {
        id: "d924fdeb-9398-4233-bc12-89d23e456f78",
        name: "pod-service-1",
        accessTime: "2024-02-01T12:00:00Z",
      },
    ],
    policies: [],
    lastAccess: "2024-02-01T12:00:00Z",
    lastRotation: "2024-04-20T12:00:00Z",
  },
  {
    id: "7h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w",
    name: "Raging Raven",
    providerID: "b3c2d1a4-8f7e-4d6c-9b5a-3e2f1c8d7b6a",
    providerName: "Azure Key Vault",
    duplicates: [
      {
        id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        name: "Solid Serpent",
        providerID: "e45c3621-5e2f-4996-91c8-9dec1a15f5fb",
        providerName: "AWS Secrets Manager",
      },
      {
        id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
        name: "Liquid Cobra",
        providerID: "2a7b4de8-31c9-45d2-b656-92c8f6947f9d",
        providerName: "GCP Secret Manager",
      },
    ],
    accessors: [
      {
        id: "e035gfec-0409-5344-cd23-90e34f567g89",
        name: "service-account-a",
        accessTime: "2024-09-11T12:00:00Z",
      },
      {
        id: "f146hgfd-1510-6455-de34-01f45g678h90",
        name: "service-account-b",
        accessTime: "2024-09-10T12:00:00Z",
      },
    ],
    policies: [
      { id: "da782198-fdfd-4d35-b6dd-7d8427b43a81", name: "rotation-policy", status: "compliant" },
      { id: "8d966424-3201-46d8-96aa-0efa1db60d08", name: "encryption-policy", status: "compliant" },
      { id: "7a966424-3201-46d8-96aa-0efa1db60d09", name: "access-policy", status: "compliant" },
      { id: "6b966424-3201-46d8-96aa-0efa1db60d10", name: "naming-policy", status: "non_compliant" },
    ],
    lastAccess: "2024-09-11T12:00:00Z",
    lastRotation: "2024-03-31T12:00:00Z",
  },
  {
    id: "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    name: "Screaming Mantis",
    providerID: "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    providerName: "HashiCorp Vault",
    duplicates: [
      {
        id: "7h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w",
        name: "Raging Raven",
        providerID: "b3c2d1a4-8f7e-4d6c-9b5a-3e2f1c8d7b6a",
        providerName: "Azure Key Vault",
      },
      {
        id: "9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c",
        name: "Solid Serpent",
        providerID: "e45c3621-5e2f-4996-91c8-9dec1a15f5fb",
        providerName: "AWS Secrets Manager",
      },
    ],
    accessors: [
      {
        id: "g257igfe-2621-7566-ef45-12g56h789i01",
        name: "app-service-1",
        accessTime: "2024-01-15T12:00:00Z",
      },
      {
        id: "h368jgff-3732-8677-fg56-23h67i890j12",
        name: "app-service-2",
        accessTime: "2024-01-14T12:00:00Z",
      },
    ],
    policies: [
      { id: "da782198-fdfd-4d35-b6dd-7d8427b43a82", name: "rotation-policy", status: "compliant" },
      { id: "8d966424-3201-46d8-96aa-0efa1db60d11", name: "encryption-policy", status: "compliant" },
      { id: "7a966424-3201-46d8-96aa-0efa1db60d12", name: "access-policy", status: "compliant" },
    ],
    lastAccess: "2024-01-15T12:00:00Z",
    lastRotation: "2023-12-25T12:00:00Z",
  },
];


export const mockPoliciesData = [
  {
    policyID: "policy-id-1",
    tenantID: "tenant-1",
    name: "Policy 1",
    executeOn: [
      "Read",
      "Update",
      "Result",
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
    rule: "cGFja2FnZSBtYWluCgppbXBvcnQgcmVnby52MQoKYWxsb3cgaWYgewoJaW5wdXQudXNlciA9PSAiYWRtaW4iCn0=",
  },
  {
    policyID: "policy-id-2",
    tenantID: "tenant-2",
    name: "Policy 2",
    executeOn: [
      "Read",
      "Update",
      "Result",
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
    rule: "cGFja2FnZSBtYWluCgppbXBvcnQgcmVnby52MQoKYWxsb3cgaWYgewoJaW5wdXQudXNlciA9PSAiYWRtaW4iCn0=",
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
    rule: "cGFja2FnZSBtYWluCgppbXBvcnQgcmVnby52MQoKYWxsb3cgaWYgewoJdHJ1ZSA9PSB0cnVlCn0=",
  },
  {
    policyID: "policy-id-4",
    tenantID: "tenant-4",
    name: "Policy 4",
    executeOn: [
      "Read",
      "Update",
    ],
    executeOnAmount: 2,
    providers: {
      amount: 0,
      items: []
    },
    engine: "rego",
    rule: "cGFja2FnZSBtYWluCgppbXBvcnQgcmVnby52MQoKYWxsb3cgaWYgewoJdHJ1ZSA9PSB0cnVlCn0=",
  },
] as const

export const mockProvidersData = [
  {
    _id: "id-1",
    providerID: "provider-id-1",
    listenerID: "listener-id",
    tenantID: "tenant-id",
    name: "GCP",
    backendIdentifier: "GCP",
    backendType: "GCP",
    config: {
      "project-id": "project",
      "topic": "topic",
      "subscription": "sub"
    },
    policies: ["policy-id-1", "policy-id-2", "policy-id-3"],
  },
  {
    id: "id-2",
    providerID: "provider-id-2",
    listenerID: "listener-id",
    tenantID: "tenant-id",
    name: "VAULT",
    backendIdentifier: "Vault",
    backendType: "VAULT",
    config: {
      "vaultAddress": "Address",
      "vaultBasePath": "secret",
      "vaultVersion": "v3",
      "socketHost": "0.1.2.3",
      "socketPort": "8000",
    },
    policies: ["policy-id-1", "policy-id-2", "policy-id-3"],
  },
  {
    _id: "id-3",
    providerID: "provider-id-3",
    listenerID: "listener-id",
    tenantID: "tenant-id",
    name: "UNKNOWN",
    backendIdentifier: "Unknown",
    backendType: "UNKNOWN",
    config: {
      "sample": "sample",
    },
    policies: ["policy-id-1", "policy-id-2", "policy-id-3"],
  },
] as const
export const mockSecretPoliciesData = {
  "42bcd969-fcd7-44fc-ad37-1749c666096d": [
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "compliant",
      "timestamp": "2025-01-24T16:56:53.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-24T16:56:53.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy0",
      "status": "error",
      "timestamp": "2025-01-24T16:56:53.080000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-23T07:46:56.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-22T21:44:20.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "compliant",
      "timestamp": "2025-01-19T12:58:53.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy1",
      "status": "compliant",
      "timestamp": "2025-01-19T02:14:14.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-07T01:54:31.080000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "42bcd969-fcd7-44fc-ad37-1749c666096d",
      "name": "Policy0",
      "status": "non_compliant",
      "timestamp": "2025-01-02T13:41:51.080000"
    }
  ],
  "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071": [
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-24T16:56:53.085000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-24T16:56:53.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "error",
      "timestamp": "2025-01-24T16:56:53.083000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-24T16:56:53.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "error",
      "timestamp": "2025-01-23T13:08:06.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "non_compliant",
      "timestamp": "2025-01-19T15:23:12.083000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-15T15:53:20.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-14T18:26:42.085000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy1",
      "status": "non_compliant",
      "timestamp": "2025-01-13T21:45:21.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "error",
      "timestamp": "2025-01-13T11:43:04.084000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "non_compliant",
      "timestamp": "2025-01-02T08:19:59.083000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
      "name": "Policy0",
      "status": "non_compliant",
      "timestamp": "2024-12-30T05:07:50.085000"
    }
  ],
  "6d4fc522-5322-4f5a-88db-f77204164a8f": [
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "6d4fc522-5322-4f5a-88db-f77204164a8f",
      "name": "Policy1",
      "status": "compliant",
      "timestamp": "2025-01-24T16:56:53.085000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "6d4fc522-5322-4f5a-88db-f77204164a8f",
      "name": "Policy1",
      "status": "error",
      "timestamp": "2025-01-04T23:57:13.085000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "6d4fc522-5322-4f5a-88db-f77204164a8f",
      "name": "Policy1",
      "status": "error",
      "timestamp": "2024-12-27T05:35:58.085000"
    }
  ],
  "dce25246-c9eb-4dc6-9bcd-19a8d87569ca": [
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "dce25246-c9eb-4dc6-9bcd-19a8d87569ca",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-24T16:56:53.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "dce25246-c9eb-4dc6-9bcd-19a8d87569ca",
      "name": "Policy0",
      "status": "compliant",
      "timestamp": "2025-01-11T06:15:53.081000"
    },
    {
      "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
      "policyID": "dce25246-c9eb-4dc6-9bcd-19a8d87569ca",
      "name": "Policy0",
      "status": "non_compliant",
      "timestamp": "2025-01-05T04:58:58.081000"
    }
  ]
} as const

export const mockSecretPolicyLogsData = [
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "compliant",
    "timestamp": "2025-01-24T16:56:53.085000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "compliant",
    "timestamp": "2025-01-24T16:56:53.084000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "error",
    "timestamp": "2025-01-24T16:56:53.083000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy1",
    "status": "non_compliant",
    "timestamp": "2025-01-24T16:56:53.081000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "error",
    "timestamp": "2025-01-23T13:08:06.084000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "non_compliant",
    "timestamp": "2025-01-19T15:23:12.083000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy1",
    "status": "non_compliant",
    "timestamp": "2025-01-15T15:53:20.081000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "compliant",
    "timestamp": "2025-01-14T18:26:42.085000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy1",
    "status": "non_compliant",
    "timestamp": "2025-01-13T21:45:21.081000"
  },
  {
    "secretID": "229ce9e1-7397-4a03-9a57-d060578edd62",
    "policyID": "5d0749bc-0e6f-4c28-81d7-99d5dfbf2071",
    "name": "Policy0",
    "status": "error",
    "timestamp": "2025-01-13T11:43:04.084000"
  }
] as const

export const mockSecretAccessorsData = {
  "accessor_3506": [
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "c5381f36-a7f9-4748-9d5c-842198ddab7b",
      name: "accessor_3506",
      timestamp: "2025-01-19T18:19:37.411000"
    },
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "c5381f36-a7f9-4748-9d5c-842198ddab7b",
      name: "accessor_3506",
      timestamp: "2025-01-09T09:03:37.411000"
    }
  ],
  "accessor_6000": [
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "eb4e3c5e-5e8b-487b-9d8a-354b26628d2e",
      name: "accessor_6000",
      timestamp: "2025-01-19T03:41:29.411000"
    },
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "eb4e3c5e-5e8b-487b-9d8a-354b26628d2e",
      name: "accessor_6000",
      timestamp: "2025-01-05T23:55:35.411000"
    }
  ],
  "accessor_6570": [
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "58dc5d77-dbdd-458a-bfee-62337ba5bda0",
      name: "accessor_6570",
      timestamp: "2025-01-20T10:43:21.410000"
    },
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "58dc5d77-dbdd-458a-bfee-62337ba5bda0",
      name: "accessor_6570",
      timestamp: "2025-01-18T11:08:15.410000"
    }
  ],
  "accessor_6678": [
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "c0d70b95-b2a8-4cc7-9a31-5e59bffba60d",
      name: "accessor_6678",
      timestamp: "2025-01-02T20:35:03.412000"
    },
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "c0d70b95-b2a8-4cc7-9a31-5e59bffba60d",
      name: "accessor_6678",
      timestamp: "2024-12-25T14:28:16.412000"
    }
  ],
  "accessor_7059": [
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "f9958435-b647-4d7b-9dec-7824b2b2365e",
      name: "accessor_7059",
      timestamp: "2025-01-13T13:48:52.411000"
    },
    {
      secretID: "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
      accessorID: "f9958435-b647-4d7b-9dec-7824b2b2365e",
      name: "accessor_7059",
      timestamp: "2024-12-30T09:59:31.411000"
    }
  ]
} as const

export const mockSecretAccessorLogsData = [
  {
    "secretID": "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
    "accessorID": "c5381f36-a7f9-4748-9d5c-842198ddab7b",
    "name": "accessor_3506",
    "timestamp": "2025-01-19T18:19:37.411000"
  },
  {
    "secretID": "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
    "accessorID": "c5381f36-a7f9-4748-9d5c-842198ddab7b",
    "name": "accessor_3506",
    "timestamp": "2025-01-19T03:41:29.411000"
  },
  {
    "secretID": "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
    "accessorID": "c5381f36-a7f9-4748-9d5c-842198ddab7b",
    "name": "accessor_3506",
    "timestamp": "2025-01-09T09:03:37.411000"
  },
  {
    "secretID": "dfc02f1f-eed1-4dcd-9699-0c5cc54f5827",
    "accessorID": "c5381f36-a7f9-4748-9d5c-842198ddab7b",
    "name": "accessor_3506",
    "timestamp": "2025-01-05T23:55:35.411000"
  }
] as const

export const mockNetworkResponseDelay = () => new Promise(resolve => setTimeout(resolve, 2500))
