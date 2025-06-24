export interface SecretStoreTableData {
  name: string;
  namespace: string;
}

export interface CreateSecretStorePayload {
  manifest: string;
}

export interface DeleteSecretStorePayload {
  namespace: string;
  name: string;
}