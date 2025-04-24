import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { CreateUserDataPayload } from "@/services/users/Users.interface";

const createUserData = async (payload: CreateUserDataPayload) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/users`, payload, { headers });
  return response.data;
}


const useCreateUserData = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, CreateUserDataPayload>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useCreateUserData"],
    mutationFn: (variables: CreateUserDataPayload) => createUserData(variables),
    ...options,
  });
};

export default useCreateUserData;