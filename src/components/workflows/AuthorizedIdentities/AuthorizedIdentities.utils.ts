import type { AuthorizedIdentity } from "./AuthorizedIdentities.interfaces";

export function getFederationType(identity: AuthorizedIdentity): string {
  return identity.identitySpec?.federationRef?.kind ?? "Unknown";
}

export function getFederationName(identity: AuthorizedIdentity): string {
  return identity.identitySpec?.federationRef?.name ?? "Unknown";
}

export function getSubjectDisplay(identity: AuthorizedIdentity): string {
  const subject = identity.identitySpec?.subject?.oidc?.subject;
  if (!subject) return "N/A";
  
  const parts = subject.split(":");
  if (parts.length > 2) {
    return parts.slice(2).join(":");
  }
  return subject;
}

export function getSubjectIssuer(identity: AuthorizedIdentity): string {
  return identity.identitySpec?.subject?.oidc?.issuer ?? "N/A";
}

export function getSubjectFull(identity: AuthorizedIdentity): string {
  return identity.identitySpec?.subject?.oidc?.subject ?? "N/A";
}

export function getCredentialsCount(identity: AuthorizedIdentity): number {
  return identity.issuedCredentials?.length ?? 0;
}

export function getUniqueSourceKinds(identity: AuthorizedIdentity): string[] {
  if (!identity.issuedCredentials) return [];
  
  const kinds = new Set(
    identity.issuedCredentials.map((cred) => cred.sourceRef?.kind).filter(Boolean)
  );
  return Array.from(kinds);
}

export function formatSourceRef(
  sourceRef: { kind: string; name: string; namespace: string } | undefined
): string {
  if (!sourceRef) return "N/A";
  return `${sourceRef.kind}/${sourceRef.namespace}/${sourceRef.name}`;
}

export function formatWorkloadBinding(
  binding: { kind: string; name: string; namespace: string } | undefined
): string {
  if (!binding) return "N/A";
  return `${binding.kind}/${binding.namespace}/${binding.name}`;
}


