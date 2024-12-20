import { AuditTimelineEntry } from "@/components/audit/Audit.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
interface QueryOptions {
  startDate: string;
  endDate: string;
}

const getAuditProviderTimelineStats = async (listenerID: string, options: QueryOptions, signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secrets-by-provider/timeseries`, {
    headers,
    signal,
    params: options,
    backend: 'AUDIT_POC',
  });
  return response.data;
}

export default function useGetAuditProviderTimelineStats(
  listenerID: string,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<AuditTimelineEntry[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['audit', 'provider', 'timeline', options.startDate, options.endDate],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(listenerID, options, signal),
    ...queryOptions,
  });
}