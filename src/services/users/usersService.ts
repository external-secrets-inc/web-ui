import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';

// Fetch user data
export async function getUserData(userId: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.get(`/api/users/${userId}`, { headers });
    return response.data;
  }, { defaultError: 'Failed to fetch user details', ...options });
}

// Update user data
export async function updateUserData(userId: string, userData: { name: string; email: string }, options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData, { headers });
    return response.data;
  }, { defaultError: 'Failed to update user details', ...options });
}
