import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { TenantListener } from "@/components/audit/Audit.interfaces"; // Update the import for TenantListener
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getTenantListeners = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return [{
      id: "618af796-ab62-4bd7-bbf9-7ffed25f1740",
      name: "listener1",
      enabled: false,
      tags: {
        "additionalProp1": "v0"
      }
    }];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listeners', { headers, signal });
  return response.data.listeners;
}

/**
 * Hook to get tenant listeners with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetTenantListeners = <T = TenantListener[]>(
  mock: boolean,
  options?: Omit<UseQueryOptions<TenantListener[], AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'page' // Default to 'page' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetTenantListeners", isMocked],
    queryFn: ({ signal }) => {
      return getTenantListeners(isMocked, signal)
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

export default useGetTenantListeners;
