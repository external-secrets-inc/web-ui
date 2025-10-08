export interface CreateAuthorizationPayload {
  manifest: string;
}

export interface DeleteAuthorizationPayload {
  name: string;
}

export interface GetAuthorizationPayload {
  name: string;
}

export interface AuthorizationData {
  name: string;
  manifest: string;
  federationRef: FederationRef;
  allowedClusterSecretStores: string[];
  allowedGenerators: AllowedGenerator[];
  allowedGeneratorStates: AllowedGeneratorState[];
  subject?: FederationSubject;
}

export interface AllowedGeneratorState {
  namespace: string;
}

export interface AllowedGenerator {
  name: string;
  kind: string;
  namespace: string;
  apiVersion: string;
}

export interface FederationRef {
  kind: string;
  name: string;
}

export interface FederationSubject {
  oidc?: FederationOIDC;
  spiffe?: FederationSpiffe;
}

export interface FederationOIDC {
  issuer: string;
  subject: string;
}

export interface FederationSpiffe {
  spiffeID: string;
}


export type AuthorizationTableData = Pick<AuthorizationData, "name" | "federationRef">;
