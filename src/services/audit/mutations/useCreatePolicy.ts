import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreatePolicyPayload } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createPolicy = async (mock: boolean, payload: CreatePolicyPayload) => {
  if (mock) return 'mockedPolicyID'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/policies`, payload, { headers });
  return response.data.policyID;
}

const useCreatePolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreatePolicyPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreatePolicy"],
    mutationFn: (variables: CreatePolicyPayload) => {
      return createPolicy(mock, variables)
    },
    ...options,
  });
};

export default useCreatePolicy;
