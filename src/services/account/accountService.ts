import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';

// Fetch account (organization) data
export async function getAccountData(options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.get('/api/account', { headers });
    return {
      contact_email: response.data.email,
      contact_name: response.data.name,
      contact_phone: response.data.phone,
      tenant_id: response.data.tenant_id,
      tenant_name: response.data.tenant
    };
  }, { defaultError: 'Failed to fetch account details', ...options });
}

export async function updateAccountData(accountData: { contact_email: string; contact_name: string; contact_phone: string }, options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.patch('/api/account', {
      email: accountData.contact_email,
      name: accountData.contact_name,
      phone: accountData.contact_phone
    }, { headers });
    return response.data;
  }, { defaultError: 'Failed to update account details', ...options });
}

export async function deleteAccount(options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.delete(`/api/account`, { headers });
    return response.data;
  }, { defaultError: 'Failed to delete account', ...options });
}
