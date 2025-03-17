import { AuditTimelineEntry } from "@/components/audit/Audit.interfaces";
import { getMockProviderTimelineStats, mockNetworkResponseDelay } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

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

/**
 * Hook to get audit provider timeline stats with loading state management
 *
 * @param mock Whether to use mock data
 * @param listenerID The ID of the listener
 * @param options Query parameters including startDate, endDate, and timeUnit
 * @param queryOptions Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetAuditProviderTimelineStats = (
  mock: boolean,
  listenerID: string,
  options: QueryOptions,
  queryOptions?: Omit<UseQueryOptions<AuditTimelineEntry[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'page' // Default to 'page' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", 'useGetAuditProviderTimelineStats', isMocked, options.startDate, options.endDate],
    queryFn: ({ signal }) => getAuditProviderTimelineStats(isMocked, listenerID, options, signal),
    ...queryOptions,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isPending;

    if (loadingType === 'page') {
      setPageLoading(isLoading);
    } else if (loadingType === 'dialog') {
      setDialogLoading(isLoading);
    }

    return () => {
      if (loadingType === 'page') {
        setPageLoading(false);
      } else if (loadingType === 'dialog') {
        setDialogLoading(false);
      }
    };
  }, [result.isPending, loadingType, setPageLoading, setDialogLoading]);

  return result;
}

export default useGetAuditProviderTimelineStats;
