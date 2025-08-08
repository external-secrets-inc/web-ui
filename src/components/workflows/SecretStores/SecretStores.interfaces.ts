import { Status } from "../Common.interfaces";

export interface SecretStoreTableData {
  name: string;
  namespace: string;
  provider: string;
  capabilities?: string;
  status?: Status;
}

export interface CreateSecretStorePayload {
  manifest: string;
}

export interface UpdateSecretStorePayload {
  manifest: string;
}

export interface DeleteSecretStorePayload {
  namespace: string;
  name: string;
}

export interface GetSecretStorePayload {
  namespace: string;
  name: string;
}

export interface SecretStoreData {
  name: string;
  namespace: string;
  manifest: string;
  provider: string;
  capabilities?: string;
  status?: Status;
}
