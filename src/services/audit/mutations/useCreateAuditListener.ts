import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateAuditListenerPayload } from "@/components/audit/Audit.interfaces";
import { useAuditMock } from '@/services/audit/context/AuditMockContext';

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createAuditListener = async (
  mock: boolean,
  payload: CreateAuditListenerPayload
) => {
  if (mock) return "mockedTenantListenerID";

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners`, payload, {
    headers,
    backend: 'AUDIT_POC',
  });
  return response.data;
};

const useCreateAuditListener = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<string, AxiosError<ApiHttpError>, CreateAuditListenerPayload>,
    "mutationKey" | "mutationFn"
  >
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useCreateAuditListener", isMocked],
    mutationFn: (variables: CreateAuditListenerPayload) => createAuditListener(isMocked, variables),
    ...options,
  });
};

export default useCreateAuditListener;