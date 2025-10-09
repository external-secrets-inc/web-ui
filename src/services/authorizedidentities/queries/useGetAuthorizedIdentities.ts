import type { AuthorizedIdentity } from "@/components/workflows/AuthorizedIdentities/AuthorizedIdentities.interfaces";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axios from "@/services/axiosConfig";
import type { ApiHttpError } from "@/types";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface GetAuthorizedIdentitiesResponse {
  authorizedidentities: AuthorizedIdentity[];
}

const getAuthorizedIdentities = async (
  signal: AbortSignal
): Promise<AuthorizedIdentity[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<GetAuthorizedIdentitiesResponse>(
    "/api/v1/authorizedidentities",
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data.authorizedidentities;
};

const useGetAuthorizedIdentities = (
  options?: Omit<
    UseQueryOptions<AuthorizedIdentity[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["authorizedidentities", "useGetAuthorizedIdentities"],
    queryFn: ({ signal }) => getAuthorizedIdentities(signal),
    ...options,
  });

export default useGetAuthorizedIdentities;
