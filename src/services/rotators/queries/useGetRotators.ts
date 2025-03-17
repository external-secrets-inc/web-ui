import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Rotator } from "@/types";
import { AxiosError } from "axios";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getRotators = async (signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/rotators', { headers, signal });
  return response.data.rotators;
}

/**
 * Hook to fetch rotators with loading state management
 *
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetRotators = <T = Rotator[]>(
  options?: Omit<UseQueryOptions<Rotator[], AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["useGetRotators"],
    queryFn: ({signal}) => {
      return getRotators(signal)
    },
    ...options,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isLoading || result.isFetching;

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
  }, [result.isLoading, result.isFetching, loadingType, setPageLoading, setDialogLoading]);

  return result;
};

export default useGetRotators;
