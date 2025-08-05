export interface ServiceAccountTableData {
  name: string;
  namespace: string;
  content: Record<string, string>;
}

export interface CreateServiceAccountPayload {
  manifest: string;
}

export interface DeleteServiceAccountPayload {
  namespace: string;
  name: string;
}
