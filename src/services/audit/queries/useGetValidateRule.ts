import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { ProviderTableData } from "@/components/audit/Audit.interfaces";

const getValidateRule = async (
  executeOn: string[],
  signal: AbortSignal,
) => {
  if (executeOn.length > 0) {
    const executeOnQuery = executeOn.map(x => `executeOn=${x}`).join("&");
    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/api/validate-rule?${executeOnQuery}`, { headers, signal, backend: 'AUDIT_POC' });
    return response.data;
  }
}

const useGetValidateRule = (
  executeOn: string[],
  options?: Omit<UseQueryOptions<ProviderTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetProviders", executeOn],
    queryFn: ({ signal }) => {
      return getValidateRule(executeOn, signal)
    },
    ...options,
  });
};

export default useGetValidateRule;
