import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const createManifestToken = async (rotatorId: string) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/rotators/${rotatorId}/manifest-token`, {}, { headers });
  return response.data.token;
}

/**
 * Hook to create a rotator manifest token with loading state management
 *
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useCreateRotatorManifestToken = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useCreateRotatorManifestToken"],
    mutationFn: (variables: { id: string }) => {
      return createManifestToken(variables.id)
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

export default useCreateRotatorManifestToken;
