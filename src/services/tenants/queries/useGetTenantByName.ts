import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@/services/axiosConfig";
import { isAxiosError } from "axios";
import { ApiHttpError } from "@/types";

export interface TenantDetails {
  name: string;
}

export interface TenantValidationResult {
  exists: boolean;
  details?: TenantDetails;
}

const validateTenantName = async (signal: AbortSignal, tenantName: string): Promise<TenantValidationResult> => {
  try {
    const response = await axiosInstance.get<TenantDetails>(
      `/public/tenants/${encodeURIComponent(tenantName)}`,
      { signal }
    );

    return {
      exists: true,
      details: response.data
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return { exists: false };
    }
    throw error;
  }
};

export const useGetTenantByName = <T = TenantValidationResult>(
  tenantName: string,
  options?: Omit<UseQueryOptions<TenantValidationResult, ApiHttpError, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['auth', 'useGetTenantByName', tenantName] as const,
    queryFn: ({ signal }) => validateTenantName(signal, tenantName),
    retry: (failureCount) => failureCount < 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const isTenantRegistered = (result: TenantValidationResult | undefined): boolean => {
  return !!result?.exists;
};

export const isTenantAvailable = (result: TenantValidationResult | undefined): boolean => {
  return result !== undefined && !result.exists;
};