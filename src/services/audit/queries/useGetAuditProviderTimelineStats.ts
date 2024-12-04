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

interface QueryOptions {
  timeRange: '7d' | '30d' | '90d'
}

const getAuditProviderTimelineStats = async (mock: boolean, options: QueryOptions, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderTimelineStats[options.timeRange];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/audit/stats/providers/timeline/${options.timeRange}`, {
    headers,
    signal,
  });
  return response.data;
}

export default function useGetAuditProviderTimelineStats(
  mock: boolean = true,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<ProviderTimelineStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', 'provider', 'timeline', options.timeRange],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(mock, options, signal),
    ...queryOptions,
  });
}