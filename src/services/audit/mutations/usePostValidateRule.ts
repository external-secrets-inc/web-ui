import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface ValidateRulePayload {
  regoCode: string;
  policySample: object;
  executeOn: string[];
}

interface ValidateRuleResponse {
  valid: boolean;
  validationResponse: Record<string, unknown>;
}

const postValidateRule = async (payload: ValidateRulePayload): Promise<ValidateRuleResponse> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/validate-rule`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
};

const usePostValidateRule = (
  options?: Omit<UseMutationOptions<ValidateRuleResponse, AxiosError<ApiHttpError>, ValidateRulePayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["usePostValidateRule"],
    mutationFn: (variables: ValidateRulePayload) => postValidateRule(variables),
    ...options,
  });
};

export default usePostValidateRule;