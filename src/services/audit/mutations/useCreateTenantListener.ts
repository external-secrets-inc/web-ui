import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateTenantListenerPayload } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createTenantListener = async (
  mock: boolean,
  payload: CreateTenantListenerPayload
) => {
  if (mock) return "mockedTenantListenerID";

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners`, payload, {
    headers,
  });
  return response.data.id;
};

/**
 * Hook to create a tenant listener with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useCreateTenantListener = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<
      string,
      AxiosError<ApiHttpError>,
      CreateTenantListenerPayload
    >,
    "mutationKey" | "mutationFn"
  >,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useCreateTenantListener", isMocked],
    mutationFn: (variables: CreateTenantListenerPayload) => {
      return createTenantListener(isMocked, variables);
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

export default useCreateTenantListener;
