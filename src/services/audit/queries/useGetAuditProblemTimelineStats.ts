import { AuditTimelineEntry } from "@/components/audit/Audit.interfaces";
import { getMockProblemTimelineStats, mockNetworkResponseDelay } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
interface QueryOptions {
  startDate: string;
  endDate: string;
}

const getAuditProblemTimelineStats = async (listenerID: string, options: QueryOptions, signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secret-issues/timeseries`, {
    headers,
    signal,
    params: options,
    backend: 'AUDIT_POC',
  });
  return response.data;
}

export default function useGetAuditProblemTimelineStats(
  listenerID: string,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<AuditTimelineEntry[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', 'problem', 'timeline', options.startDate, options.endDate],
    queryFn: ({ signal }) => getAuditProblemTimelineStats(listenerID, options, signal),
    ...queryOptions,
  });
}