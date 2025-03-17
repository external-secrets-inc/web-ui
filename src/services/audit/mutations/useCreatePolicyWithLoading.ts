import { useMutation } from '@tanstack/react-query';
import { ApiHttpError } from '@/types';
import { AxiosError } from 'axios';
import { CreatePolicyPayload } from '@/components/audit/Audit.interfaces';
import { handleDefaultApiHttpError } from '@/services/servicesHelpers';
import { toast } from 'sonner';
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';
import { mockNetworkResponseDelay } from '../mocks/mockData';
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

/**
 * Enhanced version of useCreatePolicy that automatically handles loading states
 *
 * @param mock Whether to use mock data
 * @param onSuccess Optional callback for successful mutations
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useCreatePolicyWithLoading = (
  mock: boolean,
  onSuccess?: () => void,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog'
) => {
  const { setPageLoading, setDialogLoading } = useLoading();
  const { isMocked } = useAuditMock(mock);

  // Define mutation function directly
  const createPolicy = async (payload: CreatePolicyPayload) => {
    if (isMocked) {
      await mockNetworkResponseDelay();
      return { success: true, id: 'mock-id-' + Date.now() };
    }

    const headers = await getAuthHeaders();
    const response = await axiosInstance.post('/api/policies', payload, {
      headers,
      backend: 'AUDIT_POC'
    });
    return response.data;
  };

  const result = useMutation<any, AxiosError<ApiHttpError>, CreatePolicyPayload>({
    mutationFn: createPolicy,
    onError: (error) => handleDefaultApiHttpError(error, "Error while trying to create Policy"),
    onSuccess: () => {
      toast.success("Policy created successfully");
      if (onSuccess) onSuccess();
    },
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

export default useCreatePolicyWithLoading;
