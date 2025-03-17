import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay, mockSecretPoliciesData } from "../mocks/mockData";
import { SecretPolicies } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getSecretPolicies = async (
  mock: boolean,
  secretID: string,
  signal: AbortSignal,
) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return mockSecretPoliciesData;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/secrets/${secretID}/policies`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

/**
 * Hook to get secret policies with loading state management
 *
 * @param mock Whether to use mock data
 * @param secretID The ID of the secret
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetSecretPolicies = (
  mock: boolean,
  secretID: string,
  options?: Omit<UseQueryOptions<SecretPolicies, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'page' // Default to 'page' as specified in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetSecretPolicies", isMocked],
    queryFn: ({ signal }) => getSecretPolicies(isMocked, secretID, signal),
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

export default useGetSecretPolicies;
