export interface FederationRef {
  kind: string;
  name: string;
}

export interface OIDCSubject {
  issuer: string;
  subject: string;
}

export interface Subject {
  oidc?: OIDCSubject;
}

export interface IdentitySpec {
  federationRef: FederationRef;
  subject: Subject;
}

export interface SourceRef {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
}

export interface WorkloadBinding {
  kind: string;
  name: string;
  namespace: string;
  uid: string;
}

export interface RemoteRef {
  remoteKey: string;
  property: string;
}

export interface IssuedCredential {
  lastIssuedAt: string;
  sourceRef: SourceRef;
  remoteRef?: RemoteRef;
  stateRef?: SourceRef;
  workloadBinding: WorkloadBinding;
}

export interface AuthorizedIdentity {
  name: string;
  namespace: string;
  identitySpec: IdentitySpec;
  issuedCredentials: IssuedCredential[];
  createdAt: string;
  updatedAt: string;
}

export type AuthorizedIdentitiesTableData = Pick<
  AuthorizedIdentity,
  "name" | "namespace" | "identitySpec" | "issuedCredentials"
>;


