import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, } from "@/types";
import { AxiosError } from "axios";
import { AddPolicyFormSchema } from "@/components/audit/Audit.interfaces";

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
      // "formExample": {
      //   "field1": { "type": "string", "required": true, "maxLength": 50 },
      //   "field2": { "type": "date", "required": false },
      //   "field3": { "type": "file", "required": true, "accept": "image/*" },
      //   "field4": { "type": "number", "required": true },
      //   "field5": { "type": "boolean", "required": true },
      // },
    } as AddPolicyFormSchema;
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/policies/types', { headers, signal });
  return response.data;
}

const useGetPoliciesTypes = (
  mock: boolean,
  options?: Omit<UseQueryOptions<AddPolicyFormSchema, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetPoliciesTypes", mock],
    queryFn: ({ signal }) => {
      return getPoliciesTypes(mock, signal)
    },
    ...options,
  });
};

export default useGetPoliciesTypes;
