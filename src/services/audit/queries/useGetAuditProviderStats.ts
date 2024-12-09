import { AuditMetric } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay, mockProviderStats } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
const getAuditProviderStats = async (mock: boolean, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/providers', { headers, signal }); // TODO: endpoint design not final
  return response.data;
}

const useGetAuditProviderStats = (
  mock: boolean = true,
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProviderStats", mock],
    queryFn: ({ signal }) => getAuditProviderStats(mock, signal),
    ...options,
  });
};

export default useGetAuditProviderStats;