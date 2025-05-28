import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateTenantListenerPayload } from "@/components/Audit/Audit.interfaces"; // Fix the import for CreateTenantListenerPayload
import { useAuditMock } from '@/components/Audit/AuditMockContext';

const createTenantListener = async (
  mock: boolean,
  payload: CreateTenantListenerPayload
) => {
  if (mock) return "mockedTenantListenerID";

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners`, payload, {
    headers,
  });
  return response.data.id;
};

const useCreateTenantListener = (
  mock: boolean,
  options?: Omit<
    UseMutationOptions<
      string,
      AxiosError<ApiHttpError>,
      CreateTenantListenerPayload
    >,
    "mutationKey" | "mutationFn"
  >
) => {
  const { isMocked } = useAuditMock(mock);

  return useMutation({
    mutationKey: ["useCreateTenantListener", isMocked],
    mutationFn: (variables: CreateTenantListenerPayload) => {
      return createTenantListener(isMocked, variables);
    },
    ...options,
  });
};

export default useCreateTenantListener;
