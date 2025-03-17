import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockAuditSecretsData } from "../mocks/mockData";
import { AuditSecretData } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getAuditSecrets = async (
  mock: boolean,
  listenerID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockAuditSecretsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/secrets', { headers, signal, backend: 'AUDIT_POC', params: {"listener_id": listenerID} });
  return response.data;
}

/**
 * Hook to fetch audit secrets with loading state management
 *
 * @param mock Whether to use mock data
 * @param listenerID The listener ID to get secrets for
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetAuditSecrets = (
  mock: boolean,
  listenerID: string,
  options?: Omit<UseQueryOptions<AuditSecretData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetAuditSecrets", isMocked],
    queryFn: ({ signal }) => getAuditSecrets(isMocked, listenerID, signal),
    ...options,
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

export default useGetAuditSecrets;
