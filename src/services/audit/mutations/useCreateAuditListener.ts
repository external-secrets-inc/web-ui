import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateAuditListenerPayload } from "@/components/audit/Audit.interfaces";

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
    UseMutationOptions<
      string,
      AxiosError<ApiHttpError>,
      CreateAuditListenerPayload
    >,
    "mutationKey" | "mutationFn"
  >
) => {
  return useMutation({
    mutationKey: ["useCreateAuditListener"],
    mutationFn: (variables: CreateAuditListenerPayload) => {
      return createAuditListener(mock, variables);
    },
    ...options,
  });
};

export default useCreateAuditListener;