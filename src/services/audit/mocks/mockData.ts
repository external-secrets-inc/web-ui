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
    secret: "Staff",
    lastRotation: "2024-06-03",
    policies: "3/4",
    duplicates: 5,
    lastAccess: "2024-06-29",
    accessors: 4,
  },
  {
    secret: "Kid",
    lastRotation: "2023-11-27",
    policies: "2/2",
    duplicates: 3,
    lastAccess: "2024-07-13",
    accessors: 8,
  },
  {
    secret: "Describe",
    lastRotation: "2024-07-12",
    policies: "1/3",
    duplicates: 0,
    lastAccess: "2023-11-30",
    accessors: 7,
  },
  {
    secret: "Occur",
    lastRotation: "2024-04-20",
    policies: "0/0",
    duplicates: 1,
    lastAccess: "2024-02-01",
    accessors: 2,
  },
  {
    secret: "Policy",
    lastRotation: "2024-03-31",
    policies: "2/4",
    duplicates: 4,
    lastAccess: "2024-09-11",
    accessors: 5,
  },
  {
    secret: "Field",
    lastRotation: "2023-12-25",
    policies: "3/3",
    duplicates: 2,
    lastAccess: "2024-01-15",
    accessors: 6,
  },
  {
    secret: "Project",
    lastRotation: "2024-02-14",
    policies: "1/1",
    duplicates: 0,
    lastAccess: "2024-05-20",
    accessors: 3,
  },
  {
    secret: "Task",
    lastRotation: "2024-08-07",
    policies: "3/4",
    duplicates: 1,
    lastAccess: "2024-03-08",
    accessors: 9,
  },
  {
    secret: "Build",
    lastRotation: "2024-07-01",
    policies: "4/4",
    duplicates: 3,
    lastAccess: "2024-04-10",
    accessors: 2,
  },
  {
    secret: "Create",
    lastRotation: "2024-01-30",
    policies: "1/1",
    duplicates: 0,
    lastAccess: "2023-12-15",
    accessors: 8,
  },
];


export const mockNetworkResponseDelay = () => new Promise(resolve => setTimeout(resolve, 2500))
