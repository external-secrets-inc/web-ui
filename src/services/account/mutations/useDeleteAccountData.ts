import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

const deleteAccountData = async (): Promise<number> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.delete(`/api/account`, { headers });
  return response.status;
};

const useDeleteAccountData = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useDeleteAccountData"],
    mutationFn: () => deleteAccountData(),
    ...options,
  });
};

export default useDeleteAccountData;
