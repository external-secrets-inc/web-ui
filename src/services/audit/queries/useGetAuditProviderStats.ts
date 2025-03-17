import { AuditMetric } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay, mockProviderStats } from "@/services/audit/mocks/mockData";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getAuditProviderStats = async (mock: boolean, listenerID: string, signal: AbortSignal) => {
  // TODO: Remove this mock when the API is ready
  if (mock) {
    await mockNetworkResponseDelay();
    return mockProviderStats;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listenerID}/secrets-by-provider`, { headers, signal, backend: 'AUDIT_POC', });
  return response.data;
}

/**
 * Hook to get audit provider stats with loading state management
 *
 * @param mock Whether to use mock data
 * @param listenerID The ID of the listener
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetAuditProviderStats = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditMetric[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'page' // Default to 'page' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetAuditProviderStats", isMocked],
    queryFn: ({ signal }) => getAuditProviderStats(isMocked, listenerID, signal),
    ...options,
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
};

export default useGetAuditProviderStats;
