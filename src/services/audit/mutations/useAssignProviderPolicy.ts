import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

interface AssignProviderPolicyPayload {
  providerId: string;
  policyId: string;
}

const assignProviderPolicy = async (mock: boolean, payload: AssignProviderPolicyPayload) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return { success: true };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(
    `/api/providers/${payload.providerId}/assign-policy/${payload.policyId}`,
    {},
    {
      headers,
      backend: 'AUDIT_POC',
    }
  );
  return response.data;
};

const useAssignProviderPolicy = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<unknown, AxiosError<ApiHttpError>, AssignProviderPolicyPayload>,
    "mutationFn"
  >
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useAssignProviderPolicy", isMocked],
    mutationFn: (payload) => assignProviderPolicy(isMocked, payload),
    ...options,
  });
};

export default useAssignProviderPolicy;
