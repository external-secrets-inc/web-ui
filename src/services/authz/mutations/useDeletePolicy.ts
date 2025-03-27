import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { PolicyPayload } from "../Authz.interfaces";

const deletePolicy = async (mock: boolean, payload: PolicyPayload): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/authz/policies`, { headers, data: payload });
  return response.status;
};

const useDeletePolicy = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, PolicyPayload>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useDeletePolicy", isMocked],
    mutationFn: (variables: PolicyPayload) => deletePolicy(isMocked, variables),
    ...options,
  });
};

export default useDeletePolicy;
