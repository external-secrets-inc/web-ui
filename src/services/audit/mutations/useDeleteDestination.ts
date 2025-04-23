import { UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError } from "@/types";
import { AxiosError } from "axios";

interface DeleteDestinationVariables {
  destinationID: string;
}

const deleteDestination = async (
  { destinationID }: DeleteDestinationVariables,
): Promise<void> => {
  const headers = await getAuthHeaders();
  await axiosInstance.delete(
    `/api/destinations/${destinationID}`,
    {
      headers,
      backend: 'AUDIT_POC'
    }
  );
};

export default function useDeleteDestination(
  options?: Omit<UseMutationOptions<void, AxiosError<ApiHttpError>, DeleteDestinationVariables>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDestination,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["audit", "useGetDestinations"] });
      queryClient.invalidateQueries({ queryKey: ["audit", "useGetDestination", variables.destinationID] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}