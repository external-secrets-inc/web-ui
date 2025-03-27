import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface AddRoleForUserPayload {
  role: string,
  token: string,
}


const addRoleForUser = async (mock: boolean, payload: AddRoleForUserPayload): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/authz/roles`, payload, { headers });
  return response.status;
};

const useAddRoleForUser = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, AddRoleForUserPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useAddRoleForUser", isMocked],
    mutationFn: (variables: AddRoleForUserPayload) => addRoleForUser(isMocked, variables),
    ...options,
  });
};

export default useAddRoleForUser;
