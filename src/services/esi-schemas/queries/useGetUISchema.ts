import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import type { UISchema } from "@/components/EsiSchemaForm/EsiSchemaForm.interfaces";

const getUISchema = async (resourceType: string, signal: AbortSignal): Promise<UISchema> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/ui-schemas/workflowruntemplates/eso-server/distribution-workflow`, {
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
