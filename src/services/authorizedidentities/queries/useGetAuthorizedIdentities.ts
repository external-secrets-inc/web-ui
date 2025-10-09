import type { AuthorizedIdentity } from "@/components/workflows/AuthorizedIdentities/AuthorizedIdentities.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axios from "@/services/axiosConfig";
import type { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface GetAuthorizedIdentitiesResponse {
  authorizedidentities: AuthorizedIdentity[];
}

const mock =  {
  authorizedidentities: [
    {
      name: "oidc-system-serviceaccount-dynamic-sample-web",
      namespace: "cluster-scoped",
      identitySpec: {
        federationRef: {
          kind: "KubernetesFederation",
          name: "k8s",
        },
        subject: {
          oidc: {
            issuer: "https://kubernetes.default.svc.cluster.local",
            subject: "system:serviceaccount:dynamic:sample-web",
          },
        },
      },
      issuedCredentials: [
        {
          lastIssuedAt: "2025-10-08T12:41:58Z",
          sourceRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "PostgreSql",
            name: "dynamic-psql-generator",
            namespace: "dynamic",
          },
          stateRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "GeneratorState",
            name: "postgresql-dynamic-psql-generator-sample-web-9c9b99d78-klpcl8mm",
            namespace: "dynamic",
          },
          workloadBinding: {
            kind: "Pod",
            name: "sample-web-9c9b99d78-klpqw",
            namespace: "dynamic",
            uid: "8709bb92-db41-4203-95c4-f45343bb5671",
          },
        },
        {
          lastIssuedAt: "2025-10-08T12:49:12Z",
          sourceRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "PostgreSql",
            name: "dynamic-psql-generator",
            namespace: "dynamic",
          },
          stateRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "GeneratorState",
            name: "postgresql-dynamic-psql-generator-sample-web-9c9b99d78-fsrjhdq2",
            namespace: "dynamic",
          },
          workloadBinding: {
            kind: "Pod",
            name: "sample-web-9c9b99d78-fsrsq",
            namespace: "dynamic",
            uid: "cf03ae46-5548-492e-a258-975943989ed3",
          },
        },
        {
          lastIssuedAt: "2025-10-08T12:49:13Z",
          sourceRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "PostgreSql",
            name: "dynamic-psql-generator",
            namespace: "dynamic",
          },
          stateRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "GeneratorState",
            name: "postgresql-dynamic-psql-generator-sample-web-9c9b99d78-88725j7c",
            namespace: "dynamic",
          },
          workloadBinding: {
            kind: "Pod",
            name: "sample-web-9c9b99d78-8879s",
            namespace: "dynamic",
            uid: "5a163075-71f6-444f-ad58-50f1bda7dfc9",
          },
        },
      ],
      createdAt: "0001-01-01T00:00:00Z",
      updatedAt: "2025-10-08T12:49:13Z",
    },
    {
      name: "oidc-system-serviceaccount-dynamic-openai-app",
      namespace: "cluster-scoped",
      identitySpec: {
        federationRef: {
          kind: "KubernetesFederation",
          name: "k8s",
        },
        subject: {
          oidc: {
            issuer: "https://kubernetes.default.svc.cluster.local",
            subject: "system:serviceaccount:dynamic:openai-app",
          },
        },
      },
      issuedCredentials: [
        {
          lastIssuedAt: "2025-10-08T12:49:10Z",
          sourceRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "OpenAI",
            name: "dynamic-generator",
            namespace: "dynamic",
          },
          remoteRef: {
            remoteKey: "openai-dynamic-generator-openai-app-59cbc5bbb4-gp44g-cwkfd",
            property: "dynamic",
          },
          workloadBinding: {
            kind: "Pod",
            name: "openai-app-59cbc5bbb4-gp44g",
            namespace: "dynamic",
            uid: "fa01223e-4bbb-4fbf-b415-c752239c95d5",
          },
        },
        {
          lastIssuedAt: "2025-10-08T12:49:11Z",
          sourceRef: {
            apiVersion: "generators.external-secrets.io/v1alpha1",
            kind: "OpenAI",
            name: "dynamic-generator",
            namespace: "dynamic",
          },
          remoteRef: {
            remoteKey: "openai-dynamic-generator-openai-app-59cbc5bbb4-gp44g-cwkfd",
            property: "dynamic",
          },
          workloadBinding: {
            kind: "Pod",
            name: "openai-app-59cbc5bbb4-pvrf7",
            namespace: "dynamic",
            uid: "5e1723ff-5a98-41e7-8d80-4a4dd21093ea",
          },
        },
      ],
      createdAt: "0001-01-01T00:00:00Z",
      updatedAt: "2025-10-08T12:49:11Z",
    },
  ],
};

const getAuthorizedIdentities = async (
  signal: AbortSignal
): Promise<AuthorizedIdentity[]> => {
  return mock.authorizedidentities;
  const headers = await getAuthHeaders();
  const response = await axios.get<GetAuthorizedIdentitiesResponse>(
    "/api/v1/authorizedidentities",
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data.authorizedidentities;
};

const useGetAuthorizedIdentities = (
  options?: Omit<
    UseQueryOptions<AuthorizedIdentity[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["authorizedidentities", "useGetAuthorizedIdentities"],
    queryFn: ({ signal }) => getAuthorizedIdentities(signal),
    ...options,
  });

export default useGetAuthorizedIdentities;
