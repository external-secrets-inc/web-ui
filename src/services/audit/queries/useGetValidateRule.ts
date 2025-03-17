import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";
import { useLoading } from '@/context/LoadingContext';
import { useEffect } from 'react';

interface ValidateRuleResponse {
  "secret_name": string;
  "providerID": string;
  "time": string;
  "metadata": object;
  "actor": object;
}

const getValidateRule = async (
  mock: boolean,
  executeOn: string[],
  signal: AbortSignal,
) => {
  if (executeOn.length === 0) return {};

  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "secret_name": "foobar",
      "providerID": "<uuid>",
      "time": "2024-12-29T00:00Z",
      "metadata": {},
      "actor": {
        "identifier": "email-or-token-name"
      }
    };
  }

  const executeOnQuery = executeOn.map(x => `executeOn=${x}`).join("&");
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/validate-rule?${executeOnQuery}`, { headers, signal, backend: 'AUDIT_POC' });
  return response.data;
}

/**
 * Hook to validate rules with loading state management
 *
 * @param mock Whether to use mock data
 * @param executeOn Array of rules to execute validation on
 * @param options Optional query options
 * @param loadingType Where to show loading state: 'page', 'dialog', or 'none'
 * @returns Query result with loading state automatically handled
 */
const useGetValidateRule = (
  mock: boolean,
  executeOn: string[],
  options?: Omit<UseQueryOptions<ValidateRuleResponse, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>,
  loadingType: 'page' | 'dialog' | 'none' = 'dialog' // Default to 'dialog' as recommended in updates.md
) => {
  const { isMocked } = useAuditMock(mock);
  const { setPageLoading, setDialogLoading } = useLoading();

  // Create result
  const result = useQuery({
    queryKey: ["audit", "useGetValidateRule", executeOn, isMocked],
    queryFn: ({ signal }) => {
      return getValidateRule(isMocked, executeOn, signal)
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

export default useGetValidateRule;
