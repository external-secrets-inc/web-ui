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
    kind: "one_password",
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
  { kind: "duplicated", amount: 4 },
  { kind: "non_compliant", amount: 18 },
  { kind: "never_accessed", amount: 5 },
] as const

export const mockNetworkResponseDelay = () => new Promise(resolve => setTimeout(resolve, 2500))