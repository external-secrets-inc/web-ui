import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const deletePolicy = async (mock: boolean, policyID: string) => {
  if(mock) return "MockedDeletePolicyToken"

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/policies/${policyID}`, { headers });
  return response.data.policy_id;
}

const useDeletePolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useDeletePolicy", isMocked],
    mutationFn: (variables: { id: string }) => {
      return deletePolicy(isMocked, variables.id)
    },
    ...options,
  });
};

export default useDeletePolicy;
