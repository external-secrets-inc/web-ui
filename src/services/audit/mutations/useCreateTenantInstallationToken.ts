import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/118
const createInstallationToken = async (mock: boolean, listenerId: string) => {
  if(mock) return 'mockedTokenValue'

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/listeners/${listenerId}/manifest-token`, {}, { headers });
  return response.data.token;
}

const useCreateTenantInstallationToken = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateListenerInstallationToken"],
    mutationFn: (variables: {id: string}) => {
      return createInstallationToken(mock, variables.id)
    },
    ...options,
  });
};

export default useCreateTenantInstallationToken;
