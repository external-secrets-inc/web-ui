import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const deleteUserData = async (userId: string) => {
  const headers = await getAuthHeaders();

  const response = await axiosInstance.delete(`/api/users/${userId}`, { headers });
  return response.status;
}


const useDeleteUserData = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, string>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useDeleteUserData"],
    mutationFn: (variables: string) => deleteUserData(variables),
    ...options,
  });
};

export default useDeleteUserData;