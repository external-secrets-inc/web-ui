import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';

export async function getUserData(userId: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  // We use this endpoint between the login and setting the user state in order
  // to add user data to the state. So we need to use the token from the login
  // response manually, since it won't be available from getAuthHeaders() yet.
  const headers = options.manualToken
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.manualToken}`,
      }
    : getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.get(`/api/users/${userId}`, { headers });
    return response.data;
  }, { defaultError: 'Failed to fetch user details', ...options });
}