import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/119
const deleteProvider = async (mock: boolean, providerId: string) => {
  if(mock) return "MockedDeleteProviderToken"

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/providers/${providerId}`, { headers });
  return response.data.token;
}

const useDeleteProvider = (
  mock: boolean,
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useDeleteProvider"],
    mutationFn: (variables: { id: string }) => {
      return deleteProvider(mock, variables.id)
    },
    ...options,
  });
};

export default useDeleteProvider;
