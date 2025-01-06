import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/services/auth/authHelpers";
import axiosInstance from "@/services/axiosConfig";
import { ApiHttpError, Subscription } from "@/types";
import { AxiosError } from "axios";

interface ApiSubscriptionFeature {
  name: string;
  description: string;
}

interface ApiSubscription {
  id: string;
  name: string;
  max_limit: number;
  expiry_date: string;
  features: ApiSubscriptionFeature[];
}

const getSubscriptions = async (signal: AbortSignal) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get<{ subscriptions: ApiSubscription[] }>('/api/subscriptions', { headers, signal });

  return response.data.subscriptions.map((subscription): Subscription => ({
    id: subscription.id,
    name: subscription.name,
    maxLimit: subscription.max_limit,
    expiryDate: subscription.expiry_date,
    features: subscription.features.map((feature) => ({
      name: feature.name,
      description: feature.description
    }))
  }));
};

const useGetSubscriptions = (
  options?: Omit<UseQueryOptions<Subscription[], AxiosError<ApiHttpError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ["useGetSubscriptions"],
    queryFn: ({ signal }) => getSubscriptions(signal),
    // Allow data to be stale for 1 hour to avoid unnecessary re-fetches and
    // loading states during the session
    // TODO[cfviotti]: We should probably use a more sophisticated caching
    // strategy that even persists subscriptions across page reloads in the
    // future. Perhaps storing on the JWT token?
    staleTime: 60 * 60 * 1000,
    ...options,
  });
};

export default useGetSubscriptions;