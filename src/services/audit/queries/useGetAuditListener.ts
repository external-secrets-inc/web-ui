import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { AuditListener } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getAuditListener = async (
  mock: boolean,
  signal: AbortSignal,
  listener_id: string
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      listenerID: '1234-5678-9870',
      tenantID: "4567-8910",
      status: "PENDING_INSTALLATION",
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/listeners/${listener_id}`, {
    headers,
    signal,
    backend: 'AUDIT_POC'
  });
  return response.data;
}

/**
 * Hook to get an audit listener with loading state management
 *
 * @param mock Whether to use mock data
 * @param listener_id The ID of the listener to fetch
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetAuditListener = <T = AuditListener>(
  mock: boolean,
  listener_id: string,
  options?: Omit<UseQueryOptions<AuditListener, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'page' // Default to 'page' as recommended in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetAuditListeners", isMocked, listener_id],
    queryFn: ({ signal }) => {
      return getAuditListener(isMocked, signal, listener_id)
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

export default useGetAuditListener;
