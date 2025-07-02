import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GeneratorTableData } from "@/components/workflows/Generators/Generators.interfaces";
import { mockGenerators } from "../mocks/mockData";
import { createMockResponse } from "../mocks/mockData.utils";
import { MOCK_ENABLED } from "../mocks/mockData.constants";

const getGenerators = async (signal: AbortSignal): Promise<GeneratorTableData[]> => {
  // TODO[cfviotti]: Remove this once the API is available
  if (MOCK_ENABLED) {
    return createMockResponse(mockGenerators);
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/generators', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data.generators;
};

const useGetGenerators = (
  options?: Omit<UseQueryOptions<GeneratorTableData[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetGenerators"],
    queryFn: ({ signal }) => getGenerators(signal),
    ...options,
  });
};

export default useGetGenerators;