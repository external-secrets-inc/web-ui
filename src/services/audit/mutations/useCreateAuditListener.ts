import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateAuditListenerPayload } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createAuditListener = async (
  mock: boolean,
  payload: CreateAuditListenerPayload
) => {
  if (mock) return "mockedTenantListenerID";

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners`, payload, {
    headers,
    backend: 'AUDIT_POC',
  });
  return response.data;
};

/**
 * Hook to create an audit listener with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useCreateAuditListener = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<string, AxiosError<ApiHttpError>, CreateAuditListenerPayload>,
    "mutationKey" | "mutationFn"
  >,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useCreateAuditListener", isMocked],
    mutationFn: (variables: CreateAuditListenerPayload) => createAuditListener(isMocked, variables),
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

export default useCreateAuditListener;
