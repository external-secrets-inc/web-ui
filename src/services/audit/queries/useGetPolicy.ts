import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { PolicyTableData } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay, mockPoliciesData } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getPolicy = async (mock: boolean, policyId: string, signal: AbortSignal) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockPoliciesData.find(p => p.policyID === policyId) || mockPoliciesData[0];
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/policies/${policyId}`, {
    headers,
    signal,
    backend: 'AUDIT_POC'
  });
  return response.data;
}

/**
 * Hook to fetch a specific policy with loading state management
 *
 * @param mock Whether to use mock data
 * @param policyId The policy ID to fetch
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetPolicy = (
  mock: boolean,
  policyId: string,
  options?: Omit<UseQueryOptions<PolicyTableData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetPolicy", policyId, isMocked],
    queryFn: ({ signal }) => getPolicy(isMocked, policyId, signal),
    enabled: Boolean(policyId),
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

export default useGetPolicy;
