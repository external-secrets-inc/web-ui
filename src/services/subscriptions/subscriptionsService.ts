import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { Subscription, ApiWrapperOptions, Feature } from '@/types';
import axiosInstance from '../axiosConfig';

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

export async function getSubscriptions(options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.get<{ subscriptions: ApiSubscription[] }>('/api/subscriptions', { headers });

    return response.data.subscriptions.map((subscription: ApiSubscription): Subscription => ({
      id: subscription.id,
      name: subscription.name,
      maxLimit: subscription.max_limit,
      expiryDate: subscription.expiry_date,
      features: subscription.features.map((feature: ApiSubscriptionFeature): Feature => ({
        name: feature.name,
        description: feature.description
      }))
    }));
  }, { defaultError: 'Failed to fetch subscriptions', ...options });
}
