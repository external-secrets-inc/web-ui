import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreatePolicyPayload } from "@/components/Audit/Audit.interfaces";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const createPolicy = async (mock: boolean, payload: CreatePolicyPayload) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return "policyID";
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/policies`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data.policyID;
}

const useCreatePolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreatePolicyPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useCreatePolicy", isMocked],
    mutationFn: (variables: CreatePolicyPayload) => {
      return createPolicy(isMocked, variables)
    },
    ...options,
  });
};

export default useCreatePolicy;
