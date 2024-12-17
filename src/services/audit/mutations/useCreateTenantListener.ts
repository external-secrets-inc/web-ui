import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateListenerTenantPayload } from "@/components/audit/Audit.interfaces";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const createTenantListener = async (
  mock: boolean,
  payload: CreateListenerTenantPayload
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
      CreateListenerTenantPayload
    >,
    "mutationKey" | "mutationFn"
  >
) => {
  return useMutation({
    mutationKey: ["useCreateTenantListener"],
    mutationFn: (variables: CreateListenerTenantPayload) => {
      return createTenantListener(mock, variables);
    },
    ...options,
  });
};

export default useCreateTenantListener;
