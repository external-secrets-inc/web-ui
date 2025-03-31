import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { PolicyPayload } from "../Authz.interfaces";

const createAuthzPolicy = async (mock: boolean, payload: PolicyPayload): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.post(`/api/authz/policies`, payload, { headers });
  return response.status;
};

const useCreateAuthzPolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, PolicyPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useCreateAuthzPolicy", isMocked],
    mutationFn: (variables: PolicyPayload) => createAuthzPolicy(isMocked, variables),
    ...options,
  });
};

export default useCreateAuthzPolicy;
