import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const createManifestToken = async (rotatorId: string) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/rotators/${rotatorId}/manifest-token`, {}, { headers });
  return response.data.token;
}

const useCreateRotatorManifestToken = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateRotatorManifestToken"],
    mutationFn: (variables: { id: string }) => {
      return createManifestToken(variables.id)
    },
    ...options,
  });
};

export default useCreateRotatorManifestToken;