import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface AddRoleForUserByIDPayload {
  role: string,
  user_id: string,
}


const addRoleForUserByID = async (mock: boolean, payload: AddRoleForUserByIDPayload): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/authz/roles/by-user-id`, payload, { headers });
  return response.status;
};

const useAddRoleForUserByID = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, AddRoleForUserByIDPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useAddRoleForUserByID", isMocked],
    mutationFn: (variables: AddRoleForUserByIDPayload) => addRoleForUserByID(isMocked, variables),
    ...options,
  });
};

export default useAddRoleForUserByID;
