import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

interface ValidateRulePayload {
  regoCode: string;
  policySample: object;
  executeOn: string[];
}

interface ValidateRuleResponse {
  compliant: boolean;
  validationResponse: Record<string, unknown>;
}

const postValidateRule = async (mock: boolean, payload: ValidateRulePayload): Promise<ValidateRuleResponse> => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "compliant": true,
      "validationResponse": {}
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/validate-rule`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
};

/**
 * Hook to validate a rule with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const usePostValidateRule = (
  mock: boolean,
  options?: Omit<UseMutationOptions<ValidateRuleResponse, AxiosError<ApiHttpError>, ValidateRulePayload>, 'mutationKey' | 'mutationFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["usePostValidateRule", isMocked],
    mutationFn: (variables: ValidateRulePayload) => postValidateRule(isMocked, variables),
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

export default usePostValidateRule;
