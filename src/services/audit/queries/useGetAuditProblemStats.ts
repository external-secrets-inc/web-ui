import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockProblemStats } from "../mocks/mockData";

export interface ProblemStats {
  kind: string;
  amount: number;
  label: string;
  tooltipLabel?: string;
}

const getAuditProblemStats = async (mock: boolean, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProblemStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/audit/stats/problems', { headers, signal }); // TODO: endpoint design not final
  return response.data;
}

const useGetAuditProblemStats = (
  mock: boolean = true,
  options?: Omit<UseQueryOptions<ProblemStats[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAuditProblemStats", mock],
    queryFn: ({ signal }) => getAuditProblemStats(mock, signal),
    ...options,
  });
};

export default useGetAuditProblemStats;