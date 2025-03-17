import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

interface UnassignProviderPolicyPayload {
  providerId: string;
  policyId: string;
}

const unassignProviderPolicy = async (mock: boolean, payload: UnassignProviderPolicyPayload) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return { success: true };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(
    `/api/providers/${payload.providerId}/policy-assignments/${payload.policyId}`,
    {
      headers,
      backend: 'AUDIT_POC',
    }
  );
  return response.data;
};

/**
 * Hook to unassign a provider from a policy with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useUnassignProviderPolicy = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<unknown, AxiosError<ApiHttpError>, UnassignProviderPolicyPayload>,
    "mutationFn"
  >,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useUnassignProviderPolicy", isMocked],
    mutationFn: (payload) => unassignProviderPolicy(isMocked, payload),
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

export default useUnassignProviderPolicy;
