import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GeneratorTypeOption } from "@/components/workflows/Generators/Generators.interfaces";
import { mockGeneratorTypes } from "../mocks/mockData";
import { createMockResponse } from "../mocks/mockData.utils";
import { MOCK_ENABLED } from "../mocks/mockData.constants";

const getGeneratorTypes = async (signal: AbortSignal): Promise<GeneratorTypeOption[]> => {
  // TODO[cfviotti]: Remove this once the API is available
  if (MOCK_ENABLED) {
    // Transform the mock data to match the expected GeneratorTypeOption format
    const transformedData = mockGeneratorTypes.map(type => ({
      value: type.name.toLowerCase(),
      label: type.name
    }));
    return createMockResponse(transformedData, 500);
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/v1/ui-schema/generators', {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });

  // Transform API response to match expected format
  // TODO[cfviotti]: avoid transforming the data here. Reassess when we have a proper API.
  return response.data.generatorTypes.map((type: string) => ({
    value: type.toLowerCase(),
    label: type
  }));
};

const useGetGeneratorTypes = (
  options?: Omit<UseQueryOptions<GeneratorTypeOption[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetGeneratorTypes"],
    queryFn: ({ signal }) => getGeneratorTypes(signal),
    ...options,
  });
};

export default useGetGeneratorTypes;