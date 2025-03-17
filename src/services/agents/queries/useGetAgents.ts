import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Rotator } from "@/types";
import { AxiosError } from "axios";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getAgents = async (signal:  AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/agents', { headers, signal });
  return response.data.agents;
}

/**
 * Hook to fetch all agents with loading state management
 *
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetAgents = <T = Rotator[]>(
  options?: Omit<UseQueryOptions<Rotator, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["useGetAgents"],
    queryFn: ({signal}) => {
      return getAgents(signal)
    },
    ...options,
  });

  // Handle loading state
  useEffect(() => {
    const isLoading = result.isLoading;

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
  }, [result.isLoading, loadingType, setPageLoading, setDialogLoading]);

  return result;
};

export default useGetAgents;
