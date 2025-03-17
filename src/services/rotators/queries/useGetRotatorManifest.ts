import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Manifest } from "@/types";
import { AxiosError } from "axios";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

const getManifest = async (signal: AbortSignal, rotatorId: string, version: string = "latest") => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/rotators/${rotatorId}/manifest/${version}`, { headers, signal });
  return response.data;
}

/**
 * Hook to fetch rotator manifest with loading state management
 *
 * @param id Rotator ID
 * @param version Version of the manifest, defaults to "latest"
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetRotatorManifest = <T = Manifest>(
  id: string,
  version: string = "latest",
  options?: Omit<UseQueryOptions<Manifest, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'none' // Default to 'none' to maintain backward compatibility
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["useGetRotatorManifest", id],
    queryFn: ({signal}) => {
      return getManifest(signal, id, version)
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

export default useGetRotatorManifest;
