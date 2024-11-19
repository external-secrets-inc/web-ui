import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Listener } from "@/types";
import { AxiosError } from "axios";
import qs from "qs";

// TODO remove mock parameter and return only valid data https://github.com/external-secrets-inc/web-ui/issues/115
const statuses = [
  "PROVISIONING",
  "PENDING_REGISTRATION",
  "ACTIVE",
  "OFFLINE",
  "PENDING_DELETION",
  "DELETED"
];

const getListener = async (mock: boolean, signal: AbortSignal, params?: Record<string, any>) => {
  if (mock) return {
    id: Math.floor(Math.random() * 100).toString(),
    current_status: statuses[Math.floor(Math.random() * statuses.length)]
  } as Listener;

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get('/api/listener', {
    headers, signal, params, paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' })
  });
  return response.data.Listener;
}

const useGetListener = <T = Listener>(
  mock: boolean,
  params: Record<string, any>,
  options?: Omit<UseQueryOptions<Listener, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetListener", mock, params],
    queryFn: ({ signal }) => {
      return getListener(mock, signal, params)
    },
    ...options,
  });
};

export default useGetListener;
