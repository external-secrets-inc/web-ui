import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { EditProviderPayload } from "@/components/audit/Audit.interfaces";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

export interface EditProviderVariables {
  providerID: string;
  payload: EditProviderPayload;
}

const editProvider = async (mock: boolean, { providerID, payload }: EditProviderVariables) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "_id": "677b3f9757b019d5fc82ab2b",
      "providerID": "de1d6abe-ea8a-4328-8121-3ae06f7f45ac",
      "listenerID": "a00a9e75-2361-4530-9a3f-4a37da34419f",
      "tenantID": "7cd77907-c48e-4a3c-9bea-1abfd40d1214",
      "name": "GCP Secret Manager",
      "backendIdentifier": "GCP",
      "backendType": "GCP",
      "config": {
        "projectID": "projectID",
        "topic": 'topic-name',
        "subscription": "sub",
      },
      "policies": [
        "5388752f-c167-4032-ab49-000c2b814fa8"
      ],
      "deleted_at": null,
    }
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.put(`/api/providers/${providerID}`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
}

/**
 * Hook to edit a provider with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useEditProvider = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, EditProviderVariables>, 'mutationKey' | 'mutationFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useEditProvider", isMocked],
    mutationFn: (variables: EditProviderVariables) => {
      return editProvider(isMocked, variables);
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

export default useEditProvider;
