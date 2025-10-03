import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { AuthorizationData, AuthorizationTableData } from "@/components/workflows/Authorizations/Authorizations.interfaces";

const mockAuthorizations: AuthorizationData[] = [
  {
    name: "auth-1",
    namespace: "default",
    manifest: "manifest",
    federationRef: {
      kind: "KubernetesFederation",
      name: "client-cluster-alpha",
    },
    subject: {
      issuer: "https://kubernetes.default.svc.cluster.local",
      subject: "system:serviceaccount:monitoring:prometheus-esi-client",
    },
    allowedClusterSecretStores: ["vault-prod", "vault-staging"],
    allowedGenerators: [
      { name: "db-credentials", kind: "PasswordGenerator", namespace: "default" },
      { name: "s3-token", kind: "TokenGenerator", namespace: "infrastructure" },
    ],
    allowedGeneratorStates: [{ namespace: "default" }, { namespace: "staging" }],
  },
  {
    name: "auth-2",
    namespace: "default",
    manifest: "manifest",
    federationRef: {
      kind: "SpiffeFederation",
      name: "spiffe-trust-domain",
    },
    spiffe: {
      spiffeID: "spiffe://example.org/service/frontend",
    },
    allowedClusterSecretStores: ["gcp-store", "aws-prod-store"],
    allowedGenerators: [
      { name: "jwt-signer", kind: "JwtGenerator", namespace: "security" },
    ],
    allowedGeneratorStates: [{ namespace: "security" }],
  },
  {
    name: "auth-3",
    namespace: "default",
    manifest: "manifest",
    federationRef: {
      kind: "SpiffeFederation",
      name: "spiffe-trust-domain",
    },
    subject: {
      issuer: "https://kubernetes.default.svc.cluster.local",
      subject: "system:serviceaccount:monitoring:prometheus-esi-client",
    },
    spiffe: {
      spiffeID: "spiffe://example.org/service/frontend",
    },
    allowedClusterSecretStores: ["gcp-store", "aws-prod-store"],
    allowedGenerators: [
      { name: "jwt-signer", kind: "JwtGenerator", namespace: "security" },
    ],
    allowedGeneratorStates: [{ namespace: "security" }],
  },
];

export const getAuthorizations = async (signal: AbortSignal): Promise<AuthorizationTableData[]> => {
  return mockAuthorizations

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/authorizations/`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.authorizations;
};

const useGetAuthorizations = (
  options?: Omit<UseQueryOptions<AuthorizationTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["authorizations", "useGetAuthorizations"],
    queryFn: ({ signal }) => getAuthorizations(signal),
    ...options,
  });
};

export default useGetAuthorizations;
