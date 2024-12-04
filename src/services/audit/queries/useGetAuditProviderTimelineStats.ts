import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, getMockProviderTimelineStats } from "@/services/audit/mocks/mockData";

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
  startDate: string;
  endDate: string;
}

const getAuditProviderTimelineStats = async (mock: boolean, options: QueryOptions, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return getMockProviderTimelineStats(options.startDate, options.endDate);
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/providers/timeline', {
    headers,
    signal,
    params: options
  });
  return response.data;
}

export default function useGetAuditProviderTimelineStats(
  mock: boolean = true,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<ProviderTimelineStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', 'provider', 'timeline', options.startDate, options.endDate],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(mock, options, signal),
    ...queryOptions,
  });
}