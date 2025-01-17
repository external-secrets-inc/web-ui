import { AuditTimelineEntry } from "@/components/audit/Audit.interfaces";
import { getMockProviderTimelineStats, mockNetworkResponseDelay } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
interface QueryOptions {
  startDate: string;
  endDate: string;
  timeUnit: string;
}

const getAuditProviderTimelineStats = async (mock: boolean, listenerID: string, options: QueryOptions, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return getMockProviderTimelineStats(options.startDate, options.endDate);
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secrets-by-provider/timeseries`, {
    headers,
    signal,
    params: options,
    backend: 'AUDIT_POC',
  });
  return response.data;
}

const useGetAuditProviderTimelineStats = (
  mock: boolean,
  listenerID: string,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<AuditTimelineEntry[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  const { isMocked } = useAuditMock(mock);
  return useQuery({
    queryKey: ['audit', 'provider', 'timeline', isMocked, options.startDate, options.endDate],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(isMocked, listenerID, options, signal),
    ...queryOptions,
  });
}

export default useGetAuditProviderTimelineStats;