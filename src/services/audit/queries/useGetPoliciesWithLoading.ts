import { useQuery } from '@tanstack/react-query';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';
import { ApiHttpError } from '@/types';
import { AxiosError } from 'axios';
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants';
import { PolicyTableData } from '@/components/audit/Audit.interfaces';
import { mockNetworkResponseDelay, mockPoliciesData } from '../mocks/mockData';
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

/**
 * Enhanced version of useGetPolicies that automatically handles loading states
 *
 * @param mock Whether to use mock data
 * @param tenantID The tenant ID to get policies for
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetPoliciesWithLoading = (
  mock: boolean,
  tenantID: string,
  loadingType: 'page' | 'dialog' | 'none' = 'page'
) => {
  const { isMocked } = useAuditMock(mock);

  // Define the query function directly
  const fetchPolicies = async ({ signal }: { signal: AbortSignal }) => {
    if (isMocked) {
      await mockNetworkResponseDelay();
      return mockPoliciesData;
    }

    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/api/policies`, {
      headers,
      signal,
      params: { tenantID },
      backend: 'AUDIT_POC'
    });
    return response.data;
  };

  const { setPageLoading, setDialogLoading } = useLoading();

  // Use React Query's useQuery directly
  const result = useQuery<PolicyTableData[], AxiosError<ApiHttpError>, PolicyTableData[]>({
    queryKey: ["policies", tenantID, isMocked],
    queryFn: fetchPolicies,
    refetchInterval: 20 * ONE_SECOND_IN_MILLISECONDS,
    refetchIntervalInBackground: true,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isLoading || result.isFetching;

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
  }, [result.isLoading, result.isFetching, loadingType, setPageLoading, setDialogLoading]);

  return result;
};

export default useGetPoliciesWithLoading;
