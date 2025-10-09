import type { AuthorizedIdentity } from "@/components/workflows/AuthorizedIdentities/AuthorizedIdentities.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axios from "@/services/axiosConfig";
import type { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const getAuthorizedIdentity = async (
  name: string,
  signal: AbortSignal
): Promise<AuthorizedIdentity> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<AuthorizedIdentity>(
    `/api/v1/authorizedidentities/cluster-scoped/${name}`,
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data;
};

const useGetAuthorizedIdentity = (
  name: string,
  options?: Omit<
    UseQueryOptions<AuthorizedIdentity, AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["authorizedidentities", "useGetAuthorizedIdentity", name],
    queryFn: ({ signal }) => getAuthorizedIdentity(name, signal),
    enabled: !!name,
    ...options,
  });

export default useGetAuthorizedIdentity;
