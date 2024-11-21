import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProviderStats } from "@/services/audit/mocks/mockData";

export interface ProviderStats {
  kind: string;
  amount: number;
  label: string;
  tooltipLabel?: string;
}

const getAuditProviderStats = async (mock: boolean, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/providers', { headers, signal });
  return response.data;
}

const useGetAuditProviderStats = (
  mock: boolean = true,
  options?: Omit<UseQueryOptions<ProviderStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProviderStats", mock],
    queryFn: ({ signal }) => getAuditProviderStats(mock, signal),
    ...options,
  });
};

export default useGetAuditProviderStats;