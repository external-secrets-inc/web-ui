import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

interface CreateRotatorPayload {
  name: string;
  tags?: string[];
}

const createRotator = async (payload: CreateRotatorPayload) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/rotators/`, payload, { headers });
  return response.data.id;
}

/**
 * Hook to create a rotator with loading state management
 *
 * @param options Optional mutation options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Mutation result with loading state automatically handled
 */
const useCreateRotator = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreateRotatorPayload>, 'mutationKey' | 'mutationFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useMutation({
    mutationKey: ["useCreateRotator"],
    mutationFn: (variables: CreateRotatorPayload) => {
      return createRotator(variables)
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

export default useCreateRotator;
