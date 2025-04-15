import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";
import { AccountDataUpdate } from "../Account.interfaces";

const updateAccountData = async (mock: boolean, payload: AccountDataUpdate): Promise<number> => {
  if (mock) {
    return 200
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/api/account`, {
    email: payload.contact_email,
    name: payload.contact_name,
    phone: payload.contact_phone
  }, { headers });
  return response.status;
};

const useUpdateAccountData = (
  mock: boolean,
  options?: Omit<UseMutationOptions<number, AxiosError<ApiHttpError>, AccountDataUpdate>, 'mutationKey' | 'mutationFn'>
) => {
  const isMocked = mock;

  return useMutation({
    mutationKey: ["useUpdateAccountData", isMocked],
    mutationFn: (variables: AccountDataUpdate) => updateAccountData(isMocked, variables),
    ...options,
  });
};

export default useUpdateAccountData;
