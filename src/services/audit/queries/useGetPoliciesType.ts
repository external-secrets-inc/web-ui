import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";

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

const useGetPoliciesTypes = (
  mock: boolean,
  options?: Omit<UseQueryOptions<object, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["audit", "useGetPoliciesTypes", mock],
    queryFn: ({ signal }) => {
      return getPoliciesTypes(mock, signal)
    },
    ...options,
  });
};

export default useGetPoliciesTypes;
