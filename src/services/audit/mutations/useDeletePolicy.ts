import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { mockNetworkResponseDelay } from "../mocks/mockData";

const deletePolicy = async (mock: boolean, policyID: string) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return "policyID";
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/policies/${policyID}`, { headers, backend: 'AUDIT_POC' });
  return response.data.policy_id;
}

const useDeletePolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useDeletePolicy"],
    mutationFn: (variables: { id: string }) => {
      return deletePolicy(mock, variables.id)
    },
    ...options,
  });
};

export default useDeletePolicy;
