import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { AccountData } from "@/services/account/Account.interfaces";

const getAccountData = async (signal:  AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/account`, { headers, signal });
  return {
    contact_email: response.data.email,
    contact_name: response.data.name,
    contact_phone: response.data.phone,
    tenant_name: response.data.tenant,
    tenant_id: response.data.tenant_id,
  } as AccountData;
}

const useGetAccountData = <T = AccountData>(
  options?: Omit<UseQueryOptions<AccountData, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetAccountData"],
    queryFn: ({signal}) => {
      return getAccountData(signal)
    },
    ...options,
  });
};

export default useGetAccountData;