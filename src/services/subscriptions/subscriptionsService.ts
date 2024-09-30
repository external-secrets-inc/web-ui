import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { Subscription, ApiWrapperOptions, Feature } from '@/types';
import axiosInstance from '../axiosConfig';

export async function getSubscriptions(options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.get('/api/subscriptions', { headers });

    return response.data.subscriptions.map((subscription: any): Subscription => ({
      id: subscription.id,
      name: subscription.name,
      maxLimit: subscription.max_limit,
      expiryDate: subscription.expiry_date,
      features: subscription.features.map((feature: any): Feature => ({
        name: feature.name,
        description: feature.description
      }))
    }));
  }, { defaultError: 'Failed to fetch subscriptions', ...options });
}