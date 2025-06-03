import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { EditPolicyPayload } from "@/components/Audit/Audit.interfaces";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/components/Audit/AuditMockContext';

export interface EditPolicyVariables {
  policyID: string;
  payload: EditPolicyPayload;
}

const editPolicy = async (mock: boolean, { policyID, payload }: EditPolicyVariables) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return {
      "_id": "5eb7cf5a86d9755df3a6c593",
      "policyID": "string",
      "tenantID": "string",
      "name": "string",
      "executeOn": [
        "Read"
      ],
      "engine": "string",
      "rule": "string"
    }
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.put(`/api/policies/${policyID}`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
}

const useEditPolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, EditPolicyVariables>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useEditPolicy", isMocked],
    mutationFn: (variables: EditPolicyVariables) => {
      return editPolicy(isMocked, variables);
    },
    ...options,
  });
};

export default useEditPolicy;
