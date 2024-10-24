import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const createManifestToken = async (agentId: string) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/agents/${agentId}/manifest-token`, {}, { headers });
  return response.data.token;
}

const useCreateAgentManifestToken = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateAgentManifestToken"],
    mutationFn: (variables: { id: string }) => {
      return createManifestToken(variables.id)
    },
    ...options,
  });
};

export default useCreateAgentManifestToken;