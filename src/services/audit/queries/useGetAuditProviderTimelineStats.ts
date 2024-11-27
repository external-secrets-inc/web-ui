
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProviderTimelineStats } from "@/services/audit/mocks/mockData";

export interface ProviderTimelineStats {
  date: string;
  stats: {
    kind: string;
    amount: number;
    label: string;
    tooltipLabel?: string;
  }[];
}

const getAuditProviderTimelineStats = async (mock: boolean, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderTimelineStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/providers/timeline', { headers, signal }); // TODO: endpoint design not final
  return response.data;
}

const useGetAuditProviderTimelineStats = (
  mock: boolean = true,
  options?: Omit<UseQueryOptions<ProviderTimelineStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProviderTimelineStats", mock],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(mock, signal),
    ...options,
  });
};

export default useGetAuditProviderTimelineStats;