import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const deleteAgent = async (agentId: string) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/agents/${agentId}`, { headers });
  return response.data.token;
}

const useDeleteAgent = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useDeleteAgent"],
    mutationFn: (variables: { id: string }) => {
      return deleteAgent(variables.id)
    },
    ...options,
  });
};

export default useDeleteAgent;