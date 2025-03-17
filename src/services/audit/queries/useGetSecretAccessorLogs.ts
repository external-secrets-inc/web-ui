import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretAccessorLogsData } from "../mocks/mockData";
import { AccessorDetails } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { ONE_MINUTE_IN_SECONDS } from "@/constants";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

export const getSecretAccessorLogs = async (
  mock: boolean,
  secretID: string,
  accessorName: string,
  signal?: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretAccessorLogsData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/accessors/${accessorName}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

/**
 * Hook to fetch secret accessor logs with loading state management
 *
 * @param mock Whether to use mock data
 * @param secretID The secret ID to fetch logs for
 * @param accessorName The accessor name to fetch logs for
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetSecretAccessorLogs = (
  mock: boolean,
  secretID: string,
  accessorName: string,
  options?: Omit<UseQueryOptions<AccessorDetails[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetSecretAccessorLogs", isMocked, secretID, accessorName],
    queryFn: ({ signal }) => getSecretAccessorLogs(isMocked, secretID, accessorName, signal),
    staleTime: ONE_MINUTE_IN_SECONDS * 5,
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

export default useGetSecretAccessorLogs;
