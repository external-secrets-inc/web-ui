import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";


interface CreateAgentPayload {
  name: string;
  tags?: string[];
}

const createAgent = async (payload: CreateAgentPayload) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/agents/`, payload, { headers });
  return response.data.id;
}

const useCreateAgent = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreateAgentPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateAgent"],
    mutationFn: (variables: CreateAgentPayload) => {
      return createAgent(variables)
    },
    ...options,
  });
};

export default useCreateAgent;