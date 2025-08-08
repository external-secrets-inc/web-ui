export interface SecretTableData {
  name: string;
  namespace: string;
  content: Record<string, string>;
}

export interface CreateSecretPayload {
  manifest: string;
}

export interface DeleteSecretPayload {
  namespace: string;
  name: string;
}
