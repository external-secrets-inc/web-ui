import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GeneratorStateTableData, GetGeneratorStatesByResource } from "@/components/workflows/Generators/Generators.interfaces";

const getGeneratorStatesByResource = async (
  signal: AbortSignal,
  payload: GetGeneratorStatesByResource
): Promise<GeneratorStateTableData[]> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(
    `/api/v1/generatorstates/by-resource?resourceNamespace=${payload.resourceNamespace}&resourceName=${payload.resourceName}`,
    {
      headers,
      signal,
      backend: 'ESO_SERVER'
    }
  );
  return response.data.generatorstates;
};

const useGetGeneratorStatesByResource = (
  payload: GetGeneratorStatesByResource,
  options?: Omit<UseQueryOptions<GeneratorStateTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [
      "workflows",
      "useGetGeneratorStates",
      `useGetGeneratorStates/${payload.resourceNamespace}/${payload.resourceName}`,
    ],
    queryFn: ({ signal }) => getGeneratorStatesByResource(signal, payload),
    ...options,
  });
};

export default useGetGeneratorStatesByResource;
