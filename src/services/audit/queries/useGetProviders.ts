import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProvidersData } from "../mocks/mockData";
import { ProviderTableData } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const getProviders = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProvidersData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/providers', { headers, signal });
  return response.data.Provider;
}

const useGetProviders = (
  mock: boolean,
  options?: Omit<UseQueryOptions<ProviderTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetProviders", mock],
    queryFn: ({ signal }) => {
      return getProviders(mock, signal)
    },
    ...options,
  });
};

export default useGetProviders;
