import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { UISchema } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";
import { getMockGeneratorUISchema } from "@/services/workflows/mocks/mockData";
import { createMockResponse } from "@/services/workflows/mocks/mockData.utils";
import { MOCK_ENABLED } from "@/services/workflows/mocks/mockData.constants";

const getUISchema = async (resourceType: string, signal?: AbortSignal): Promise<UISchema> => {
  // Mock for generators - handle both "generators" (type selection) and "generators/type" (specific generator)
  // TODO[cfviotti]: Remove this once the API is available
  if (MOCK_ENABLED && (resourceType === "generators" || resourceType.startsWith("generators/"))) {
    if (resourceType === "generators") {
      // Return generator types selection schema
      const schema = getMockGeneratorUISchema("generators");
      console.log("Mock: Generator types selection schema:", schema);
      return createMockResponse(schema, 600);
    } else {
      // Return specific generator type schema
      const generatorType = resourceType.split("/")[1];
      const schema = getMockGeneratorUISchema(generatorType);
      return createMockResponse(schema, 600);
    }
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/ui-schemas/${resourceType}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetUISchema = (
  resourceType: string,
  options?: Omit<UseQueryOptions<UISchema, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["esi-schemas", "useGetUISchema", resourceType],
    queryFn: ({ signal }) => getUISchema(resourceType, signal),
    ...options,
  });
};

export default useGetUISchema;
