import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const deleteRotator = async (rotatorId: string) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/rotators/${rotatorId}`, { headers });
  return response.data.token;
}

const useDeleteRotator = (
  options?: Omit<UseMutationOptions<string, AxiosError<ApiHttpError>, { id: string }>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationKey: ["useDeleteRotator"],
    mutationFn: (variables: { id: string }) => {
      return deleteRotator(variables.id)
    },
    ...options,
  });
};

export default useDeleteRotator;