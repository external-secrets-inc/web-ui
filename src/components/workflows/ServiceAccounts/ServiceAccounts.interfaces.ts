export interface ServiceAccountTableData {
  name: string;
  namespace: string;
}

export interface CreateServiceAccountPayload {
  manifest: string;
}

export interface DeleteServiceAccountPayload {
  namespace: string;
  name: string;
}
