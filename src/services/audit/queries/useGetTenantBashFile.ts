import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Bash } from "@/types";
import { AxiosError } from "axios";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/118
const getTenantBashFile = async (mock: boolean, signal:  AbortSignal, version: string = "latest", listenerId: string, token: string) => {
  if(mock) return {process: 'File with bash script to install listener!'}

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listenerId}/bash/${version}`, { headers, signal, params: {"token": token}});
  return response.data;
}

/**
 * Hook to get tenant bash file with loading state management
 *
 * @param mock Whether to use mock data
 * @param token Authentication token
 * @param version Bash file version (defaults to "latest")
 * @param listenerId The ID of the listener
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetTenantBashFile = <T = Bash>(
  mock: boolean,
  token: string,
  version: string = "latest",
  listenerId: string,
  options?: Omit<UseQueryOptions<Bash, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog' // Default to 'dialog' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetTenantBashFile", isMocked, token, listenerId],
    queryFn: ({signal}) => {
      return getTenantBashFile(isMocked, signal, version, listenerId, token)
    },
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

export default useGetTenantBashFile;
