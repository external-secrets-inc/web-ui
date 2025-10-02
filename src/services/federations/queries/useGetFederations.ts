import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GenericFederation } from "@/components/workflows/Federations/Federations.interfaces";

const mockFederations: Record<string, GenericFederation[]> = {
  kubernetes: [
    {
      name: "k8s-fed-1",
      namespace: "default",
      manifest: "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: example",
      url: "https://k8s.cluster-1.local",
    },
    {
      name: "k8s-fed-2",
      namespace: "prod",
      manifest: "apiVersion: v1\nkind: Namespace\nmetadata:\n  name: prod-ns",
      url: "https://k8s.prod.local",
    },
  ],
  spiffe: [
    {
      name: "spiffe-fed-1",
      namespace: "security",
      manifest: "apiVersion: spiffe.io/v1\nkind: TrustDomain\nmetadata:\n  name: example",
      trustDomain: "example.org",
    },
    {
      name: "spiffe-fed-2",
      namespace: "staging",
      manifest: "apiVersion: spiffe.io/v1\nkind: TrustDomain\nmetadata:\n  name: staging",
      trustDomain: "staging.example.org",
    },
  ],
};

export const getFederations = async (federationType: string, signal: AbortSignal): Promise<GenericFederation[]> => {
  return mockFederations[federationType] || [];

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/federations/${federationType}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.federations;
};

const useGetFederations = (
  federationType: string,
  options?: Omit<UseQueryOptions<GenericFederation[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["federations", "useGetFederations"],
    queryFn: ({ signal }) => getFederations(federationType, signal),
    ...options,
  });
};

export default useGetFederations;
