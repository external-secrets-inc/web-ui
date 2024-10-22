import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { Manifest } from "@/types";
import { AxiosError } from "axios";

const getManifest = async (signal:  AbortSignal, rotatorId: string, version: string = "latest") => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/rotators/${rotatorId}/manifest/${version}`, { headers, signal });
  return response.data;
}

const useGetRotatorManifest = <T = Manifest>(
  id: string,
  version: string = "latest",
  options?: Omit<UseQueryOptions<Manifest, AxiosError, T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetRotatorManifest", id],
    queryFn: ({signal}) => {
      return getManifest(signal, id, version)
    },
    ...options,
  });
};

export default useGetRotatorManifest;