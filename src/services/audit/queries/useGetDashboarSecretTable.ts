import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockAuditSecretTableData } from "../mocks/mockData";
import { AuditSecretTableData, filterSchema } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const getDashboardSecretTable = async (
  mock: boolean,
  signal: AbortSignal,
  listener_id: string,
  params: URLSearchParams,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockAuditSecretTableData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/dashboard/${listener_id}/secrets-table`, { headers, signal, backend: 'AUDIT_POC', params: params });
  return response.data;
}

/**
 * Hook to fetch dashboard secret table data with loading state management
 *
 * @param mock Whether to use mock data
 * @param listener_id The listener ID to get secrets for
 * @param params The URL parameters to filter the data
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetDashboarSecretTable = (
  mock: boolean,
  listener_id: string,
  params: URLSearchParams,
  options?: Omit<UseQueryOptions<AuditSecretTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  const filteredParams: URLSearchParams = new URLSearchParams();

  Object.keys(filterSchema.shape).forEach((key) => {
    const paramValue = params.getAll(key);
    if (paramValue.length > 0) {
      paramValue.forEach((value) => filteredParams.append(key, value));
    }
  });

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetDashboarSecretTable", isMocked, listener_id, filteredParams.toString()],
    queryFn: ({ signal }) => {
      return getDashboardSecretTable(isMocked, signal, listener_id, filteredParams);
    },
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

export default useGetDashboarSecretTable;
