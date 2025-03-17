import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Manifest } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getTenantHelm = async (mock: boolean, signal: AbortSignal, version: string = "latest", listenerId: string) => {
  if(mock) return {manifest: 'Helm chart configuration for listener installation!'}

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listenerId}/helm/${version}`, { headers, signal});
  return response.data;
}

/**
 * Hook to get tenant helm with loading state management
 *
 * @param mock Whether to use mock data
 * @param version Helm chart version (defaults to "latest")
 * @param listenerId The ID of the listener
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetTenantHelm = <T = Manifest>(
  mock: boolean,
  version: string = "latest",
  listenerId: string,
  options?: Omit<UseQueryOptions<T, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog' // Default to 'dialog' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(false);
  const finalMock = isMocked || mock;
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery<T, AxiosError<ApiHttpError>>({
    queryKey: ["audit", 'useGetTenantHelm', listenerId, version, ],
    queryFn: ({ signal }) => getTenantHelm(finalMock, signal, version, listenerId),
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

export default useGetTenantHelm;
