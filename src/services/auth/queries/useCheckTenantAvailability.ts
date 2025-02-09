import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";

const checkTenantAvailability = async (
  tenantName: string,
  signal: AbortSignal
) => {
  try {
    await axiosInstance.get(`/public/tenants/${tenantName}`, {
      signal,
    });
    // If the request succeeds, tenant exists (not available)
    return false;
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError && error.response?.status === 404) {
      // 404 means tenant doesn't exist (is available)
      return true;
    }
    throw error;
  }
};

const useCheckTenantAvailability = (
  tenantName: string | null,
  options?: Omit<UseQueryOptions<boolean, AxiosError<ApiHttpError>, boolean>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<boolean, AxiosError<ApiHttpError>>({
    queryKey: ["checkTenantAvailability", tenantName],
    queryFn: ({ signal }) => checkTenantAvailability(tenantName!, signal),
    enabled: !!tenantName && tenantName.length >= 3,
    ...options
  });
};

export default useCheckTenantAvailability; 