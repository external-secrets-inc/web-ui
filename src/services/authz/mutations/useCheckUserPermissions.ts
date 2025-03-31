import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface CheckUserPermissionPayload {
  subject: string,
  resource: string,
  action: string,
  attr: string,
}

interface CheckUserPermissionResponse {
  allowed: boolean
}

const checkUserPermission = async (mock: boolean, payload: CheckUserPermissionPayload): Promise<CheckUserPermissionResponse> => {
  if (mock) {
    return {
      "allowed": true,
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/authz/check`, payload, { headers });
  return response.data;
};

const useCheckUserPermission = (
  mock: boolean,
  options?: Omit<UseMutationOptions<CheckUserPermissionResponse, AxiosError<ApiHttpError>, CheckUserPermissionPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useCheckUserPermission", isMocked],
    mutationFn: (variables: CheckUserPermissionPayload) => checkUserPermission(isMocked, variables),
    ...options,
  });
};

export default useCheckUserPermission;
