import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const deleteAccountData = async (mock: boolean): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/account`, { headers });
  return response.status;
};

const useDeleteAccountData = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useDeleteAccountData", isMocked],
    mutationFn: () => deleteAccountData(isMocked),
    ...options,
  });
};

export default useDeleteAccountData;
