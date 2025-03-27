import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface RemoveRoleForUserPayload {
  subject: string,
  resource: string,
  action: string,
  attr: string,
  context: any
}

const removeRoleForUser = async (mock: boolean, payload: RemoveRoleForUserPayload): Promise<number> => {
  if (mock) {
    return 204
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/authz/roles`, { headers, data: payload });
  return response.status;
};

const useRemoveRoleForUser = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, RemoveRoleForUserPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useRemoveRoleForUser", isMocked],
    mutationFn: (variables: RemoveRoleForUserPayload) => removeRoleForUser(isMocked, variables),
    ...options,
  });
};

export default useRemoveRoleForUser;
