export interface CreateFederationPayload {
  manifest: string;
}

export interface DeleteFederationPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface GetFederationPayload {
  kind: string;
  namespace: string;
  name: string;
}

export interface FederationData {
  name: string;
  namespace: string;
  kind: string;
  manifest: string;
  details?: Record<string, string>;
}

export type FederationTableData = Pick<FederationData, "name" | "namespace" | "kind" | "details">;

export interface GenericFederation {
  name: string;
  namespace: string;
  manifest: string;
  [key: string]: string;
}
