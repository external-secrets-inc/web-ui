import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { UpdateUserDataPayload } from "@/services/users/Users.interface";

const updateUserData = async (payload: UpdateUserDataPayload) => {
  const headers = await getAuthHeaders();
  const {id: userId, ...userData} = payload

  const response = await axiosInstance.put(`/api/users/${userId}`, userData, { headers });
  return response.status;
}


const useUpdateUserData = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, UpdateUserDataPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useUpdateUserData"],
    mutationFn: (variables: UpdateUserDataPayload) => updateUserData(variables),
    ...options,
  });
};

export default useUpdateUserData;