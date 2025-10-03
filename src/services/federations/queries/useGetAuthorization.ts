import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { AuthorizationData, GetAuthorizationPayload } from "@/components/workflows/Authorizations/Authorizations.interfaces";

const mockAuthorization: Record<string, AuthorizationData> = {
  "default/auth-1": {
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
  "default/auth-2":{
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
  "default/auth-3": {
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
};

const getAuthorization = async (signal: AbortSignal, payload: GetAuthorizationPayload,): Promise<AuthorizationData> => {
  return mockAuthorization[`${payload.namespace}/${payload.name}`]
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/authorizations/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetAuthorization = (
  payload: GetAuthorizationPayload,
  options?: Omit<UseQueryOptions<AuthorizationData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["authorizations", "useGetAuthorization", `useGetAuthorization/${payload.namespace}/${payload.name}`],
    queryFn: ({ signal }) => getAuthorization(signal, payload),
    ...options,
  });
};

export default useGetAuthorization;
