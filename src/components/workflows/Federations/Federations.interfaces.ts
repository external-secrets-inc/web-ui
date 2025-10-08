export interface CreateFederationPayload {
  manifest: string;
}

export interface DeleteFederationPayload {
  kind: string;
  name: string;
}

export interface GetFederationPayload {
  kind: string;
  name: string;
}

export interface FederationData {
  name: string;
  kind: string;
  manifest: string;
  details?: Record<string, string>;
}

export type FederationTableData = Pick<FederationData, "name" | "kind" | "details">;

export interface GenericFederation {
  name: string;
  manifest: string;
  [key: string]: string;
}
