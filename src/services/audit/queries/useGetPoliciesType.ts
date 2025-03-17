import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const getPoliciesTypes = async (
  mock: boolean,
  signal: AbortSignal,
) => {
  if (mock) {
    return {
      "rego": {
        "executeOn": { "type": "strArray", "required": true },
        "sample": { "type": "textArea", "required": false, "maxLength": 500 },
        "rule": { "type": "textArea", "required": true, "maxLength": 999 },
      },
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/policies/types', { headers, signal });
  return response.data;
}

/**
 * Hook to get policies types with loading state management
 *
 * @param mock Whether to use mock data
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetPoliciesTypes = (
  mock: boolean,
  options?: Omit<UseQueryOptions<object, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog' // Default to 'dialog' as specified in updates.md
) => {
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetPoliciesTypes", mock],
    queryFn: ({ signal }) => {
      return getPoliciesTypes(mock, signal)
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

export default useGetPoliciesTypes;
