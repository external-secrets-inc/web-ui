import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface RemoveRoleForUserByIDPayload {
  role: string,
  user_id: string
}

const removeRoleForUserByID = async (mock: boolean, payload: RemoveRoleForUserByIDPayload): Promise<number> => {
  if (mock) {
    return 204
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/authz/roles/by-user-id`, { headers, data: payload });
  return response.status;
};

const useRemoveRoleForUserByID = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, RemoveRoleForUserByIDPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useRemoveRoleForUserByID", isMocked],
    mutationFn: (variables: RemoveRoleForUserByIDPayload) => removeRoleForUserByID(isMocked, variables),
    ...options,
  });
};

export default useRemoveRoleForUserByID;
