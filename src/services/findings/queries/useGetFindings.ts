import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import axios from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import { AxiosError } from "axios";
import { Finding } from "@/components/workflows/Findings/Findings.interfaces";

interface GetFindingsResponse {
  findings: Finding[];
}

const getFindings = async (signal: AbortSignal): Promise<Finding[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<GetFindingsResponse>("/api/v1/findings", {
    headers,
    signal,
    backend: "ESO_SERVER",
  });
  return response.data.findings;
};

const useGetFindings = (
  options?: Omit<
    UseQueryOptions<Finding[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["findings", "useGetFindings"],
    queryFn: ({ signal }) => getFindings(signal),
    ...options,
  });

export default useGetFindings;