import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { GeneratorData, GetGeneratorPayload } from "@/components/workflows/Generators/Generators.interfaces";

const getGenerator = async (signal: AbortSignal, payload: GetGeneratorPayload,): Promise<GeneratorData> => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/v1/generators/${payload.kind}/${payload.namespace}/${payload.name}`, {
    headers,
    signal,
    backend: 'ESO_SERVER'
  });
  return response.data;
};

const useGetGenerator = (
  payload: GetGeneratorPayload,
  options?: Omit<UseQueryOptions<GeneratorData, AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["workflows", "useGetGenerator", `useGetGenerator/${payload.kind}/${payload.namespace}/${payload.name}`],
    queryFn: ({ signal }) => getGenerator(signal, payload),
    ...options,
  });
};

export default useGetGenerator;
