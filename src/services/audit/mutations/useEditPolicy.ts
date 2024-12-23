import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { EditPolicyPayload } from "@/components/audit/Audit.interfaces";

export interface EditPolicyVariables {
  policyID: string;
  payload: EditPolicyPayload;
}

const editPolicy = async ({ policyID, payload }: EditPolicyVariables) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.put(`/api/policies/${policyID}`, payload, { headers, backend: 'AUDIT_POC' });
  return response.data;
}

const useEditPolicy = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, EditPolicyVariables>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useEditPolicy"],
    mutationFn: editPolicy,
    ...options,
  });
};

export default useEditPolicy;
