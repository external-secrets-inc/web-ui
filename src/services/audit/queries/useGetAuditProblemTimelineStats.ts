
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

const getAuditProblemTimelineStats = async (mock: boolean, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProblemTimelineStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/problems/timeline', { headers, signal }); // TODO: endpoint design not final
  return response.data;
}

const useGetAuditProblemTimelineStats = (
  mock: boolean = true,
  options?: Omit<UseQueryOptions<ProblemTimelineStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProblemTimelineStats", mock],
    queryFn: ({ signal }) => getAuditProblemTimelineStats(mock, signal),
    ...options,
  });
};

export default useGetAuditProblemTimelineStats;