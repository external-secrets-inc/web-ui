import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import axios from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import { AxiosError } from "axios";
import { Consumer } from "@/components/workflows/Consumers/Consumers.interfaces";

const getConsumer = async (
  namespace: string,
  name: string,
  signal: AbortSignal
): Promise<Consumer> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<Consumer>(
    `/api/v1/consumers/${namespace}/${name}`,
    {
      headers,
      signal,
      backend: "ESO_SERVER",
    }
  );
  return response.data;
};

const useGetConsumer = (
  namespace: string,
  name: string,
  options?: Omit<
    UseQueryOptions<Consumer, AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["consumers", "useGetConsumer", namespace, name],
    queryFn: ({ signal }) => getConsumer(namespace, name, signal),
    enabled: !!namespace && !!name,
    ...options,
  });

export default useGetConsumer;
