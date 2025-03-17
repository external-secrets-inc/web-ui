import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { EditPolicyPayload } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

export interface EditPolicyVariables {
  policyID: string;
  payload: EditPolicyPayload;
}

const editPolicy = async (mock: boolean, { policyID, payload }: EditPolicyVariables) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "_id": "5eb7cf5a86d9755df3a6c593",
      "policyID": "string",
      "tenantID": "string",
      "name": "string",
      "executeOn": [
        "Read"
      ],
      "engine": "string",
      "rule": "string"
    }
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.put(`/api/policies/${policyID}`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
}

/**
 * Hook to edit a policy with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useEditPolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, EditPolicyVariables>, 'mutationKey' | 'mutationFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useEditPolicy", isMocked],
    mutationFn: (variables: EditPolicyVariables) => {
      return editPolicy(isMocked, variables);
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

export default useEditPolicy;
