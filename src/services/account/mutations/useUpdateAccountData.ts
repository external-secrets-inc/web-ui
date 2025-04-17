import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { AccountDataUpdate } from "../Account.interfaces";

const updateAccountData = async (payload: AccountDataUpdate): Promise<number> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/api/account`, {
    email: payload.contact_email,
    name: payload.contact_name,
    phone: payload.contact_phone
  }, { headers });
  return response.status;
};

const useUpdateAccountData = (
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, AccountDataUpdate>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useUpdateAccountData"],
    mutationFn: (variables: AccountDataUpdate) => updateAccountData(variables),
    ...options,
  });
};

export default useUpdateAccountData;
