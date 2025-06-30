import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";

/**
 * Fetches options from an API endpoint for oneOf fields with href configuration.
 *
 * @param href - The API endpoint URL to fetch options from
 * @param signal - AbortSignal for request cancellation
 * @returns Promise resolving to an array of option objects
 */
const getEsiSchemaOptionsFromApi = async (
  href: string,
  signal: AbortSignal
): Promise<Record<string, unknown>[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(href, {
    headers,
    signal,
    backend: "ESO_SERVER",
  });

  let data = response.data;

  // Handle wrapped responses
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const keys = Object.keys(data);
    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
      data = data[keys[0]];
    }
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "API response must be an array or an object containing a single array property for schema options"
    );
  }

  return data;
};


const useGetEsiSchemaOptionsFromApi = (
  href: string | undefined,
  // Correctly typed to allow 'enabled' and other useQuery options
  options?: Omit<
    UseQueryOptions<Record<string, unknown>[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["esi-schemas", "useGetEsiSchemaOptionsFromApi", href],
    queryFn: ({ signal }) => {
      // The `enabled` option prevents this from running if href is undefined.
      return getEsiSchemaOptionsFromApi(href!, signal);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Pass through all other options, including 'enabled'
    ...options,
  });
};

export default useGetEsiSchemaOptionsFromApi;