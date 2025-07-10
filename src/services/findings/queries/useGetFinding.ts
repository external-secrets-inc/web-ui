import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import axios from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import { AxiosError } from "axios";
import { Finding } from "@/components/workflows/Findings/Findings.interfaces";

const getFinding = async (
  namespace: string,
  name: string,
  signal: AbortSignal
): Promise<Finding> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<Finding>(
    `/api/v1/findings/${namespace}/${name}`,
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data;
};

const useGetFinding = (
  namespace: string,
  name: string,
  options?: Omit<
    UseQueryOptions<Finding, AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["findings", "useGetFinding", namespace, name],
    queryFn: ({ signal }) => getFinding(namespace, name, signal),
    enabled: !!namespace && !!name,
    ...options,
  });

export default useGetFinding;