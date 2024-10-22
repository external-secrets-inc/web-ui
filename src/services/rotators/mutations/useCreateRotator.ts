import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";


interface CreateRotatorPayload {
  name: string;
  tags?: string[];
}

const createRotator = async (payload: CreateRotatorPayload) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/rotators/`, payload, { headers });
  return response.data.id;
}

const useCreateRotator = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, CreateRotatorPayload>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useCreateRotator"],
    mutationFn: (variables: CreateRotatorPayload) => {
      return createRotator(variables)
    },
    ...options,
  });
};

export default useCreateRotator;