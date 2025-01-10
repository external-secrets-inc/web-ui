import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from "../context/AuditMockContext";

interface ValidateRulePayload {
  regoCode: string;
  policySample: object;
  executeOn: string[];
}

interface ValidateRuleResponse {
  compliant: boolean;
  validationResponse: Record<string, unknown>;
}

const postValidateRule = async (mock: boolean, payload: ValidateRulePayload): Promise<ValidateRuleResponse> => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "compliant": true,
      "validationResponse": {}
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/validate-rule`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
};

const usePostValidateRule = (
  mock: boolean,
  options?: Omit<UseMutationOptions<ValidateRuleResponse, AxiosError<ApiHttpError>, ValidateRulePayload>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["usePostValidateRule", isMocked],
    mutationFn: (variables: ValidateRulePayload) => postValidateRule(isMocked, variables),
    ...options,
  });
};

export default usePostValidateRule;