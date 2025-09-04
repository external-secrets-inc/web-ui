import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import axios from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import { AxiosError } from "axios";
import { Consumer } from "@/components/workflows/Consumers/Consumers.interfaces";

interface GetConsumersResponse {
  consumers: Consumer[];
}

const getConsumers = async (signal: AbortSignal): Promise<Consumer[]> => {
  const headers = await getAuthHeaders();
  const response = await axios.get<GetConsumersResponse>("/api/v1/consumers", {
    headers,
    signal,
    backend: "ESO_SERVER",
  });
  return response.data.consumers;
};

const useGetConsumers = (
  options?: Omit<
    UseQueryOptions<Consumer[], AxiosError<ApiHttpError>>,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    queryKey: ["consumers", "useGetConsumers"],
    queryFn: ({ signal }) => getConsumers(signal),
    ...options,
  });

export default useGetConsumers;
