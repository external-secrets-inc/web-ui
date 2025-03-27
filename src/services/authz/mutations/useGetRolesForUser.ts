import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface GerRolesForUsersPayload {
  token: string
}

interface GetRolesForUsersResponse {
  roles: string[]
}

const getRolesForUsers = async (mock: boolean, payload: GerRolesForUsersPayload): Promise<GetRolesForUsersResponse> => {
  if (mock) {
    return {
      "roles": ["read", "write"],
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/authz/roles/get`, payload, { headers });
  return response.data;
};

const useGetRolesForUsers = (
  mock: boolean,
  options?: Omit<UseMutationOptions<GetRolesForUsersResponse, AxiosError<ApiHttpError>, GerRolesForUsersPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useGetRolesForUsers", isMocked],
    mutationFn: (variables: GerRolesForUsersPayload) => getRolesForUsers(isMocked, variables),
    ...options,
  });
};

export default useGetRolesForUsers;
