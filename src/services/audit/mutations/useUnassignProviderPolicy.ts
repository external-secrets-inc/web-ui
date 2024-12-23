import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { mockNetworkResponseDelay } from "../mocks/mockData";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

interface UnassignProviderPolicyPayload {
  providerId: string;
  policyId: string;
}

const unassignProviderPolicy = async (mock: boolean, payload: UnassignProviderPolicyPayload) => {
  if (mock) {
    await mockNetworkResponseDelay();
    return { success: true };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(
    `/api/providers/${payload.providerId}/unassign-policy/${payload.policyId}`,
    {
      headers,
      backend: 'AUDIT_POC',
    }
  );
  return response.data;
};

const useUnassignProviderPolicy = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<unknown, AxiosError<ApiHttpError>, UnassignProviderPolicyPayload>,
    "mutationFn"
  >
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useUnassignProviderPolicy", isMocked],
    mutationFn: (payload) => unassignProviderPolicy(isMocked, payload),
    ...options,
  });
};

export default useUnassignProviderPolicy;
