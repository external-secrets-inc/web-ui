import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProblemTimelineStats } from "@/services/audit/mocks/mockData";

export interface ProblemTimelineStats {
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

const getAuditProblemTimelineStats = async (mock: boolean, options: QueryOptions, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProblemTimelineStats[options.timeRange];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/audit/stats/problems/timeline/${options.timeRange}`, {
    headers,
    signal,
  });
  return response.data;
}

export default function useGetAuditProblemTimelineStats(
  mock: boolean = true,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<ProblemTimelineStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', 'problem', 'timeline', options.timeRange],
    queryFn: ({ signal }) => getAuditProblemTimelineStats(mock, options, signal),
    ...queryOptions,
  });
}