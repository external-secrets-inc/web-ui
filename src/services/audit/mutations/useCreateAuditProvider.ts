import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateProviderPayload } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createAuditProvider = async (mock: boolean, payload: CreateProviderPayload) => {
  if (mock) return 'mockedProviderID'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/providers`, payload, { headers });
  return response.data.id;
}

const useCreateAuditProvider = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreateProviderPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateAuditProvider"],
    mutationFn: (variables: CreateProviderPayload) => {
      return createAuditProvider(mock, variables)
    },
    ...options,
  });
};

export default useCreateAuditProvider;
