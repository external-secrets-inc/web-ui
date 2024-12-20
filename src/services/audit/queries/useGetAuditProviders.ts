import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProvidersData } from "../mocks/mockData";
import { ProviderTableData } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const getAuditProviders = async (
  mock: boolean,
  listenerID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProvidersData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/providers', { headers, signal, backend: 'AUDIT_POC', params: {"listener_id": listenerID} });
  return response.data;
}

const useGetAuditProviders = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<ProviderTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProviders", mock],
    queryFn: ({ signal }) => {
      return getAuditProviders(mock, listenerID, signal)
    },
    ...options,
  });
};

export default useGetAuditProviders;
