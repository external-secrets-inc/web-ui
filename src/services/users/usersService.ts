import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions } from '@/types';
import axiosInstance from '../axiosConfig';
import { CreateUserDataPayload, UpdateUserDataPayload } from './Users.interface';


// Update user data
export async function updateUserData(userId: string, userData: UpdateUserDataPayload, options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData, { headers });
    return response.data;
  }, { defaultError: 'Failed to update user details', ...options });
}

// Create user data
export async function createUserData(userData: CreateUserDataPayload, options: Partial<ApiWrapperOptions> = {}) {
  const headers = await getAuthHeaders();

  return apiWrapper(async () => {
    const response = await axiosInstance.post(`/api/users`, userData, { headers });
    return response.data;
  }, { defaultError: 'Failed to create user', ...options });
}

// Delete user
export async function deleteUserData(userId: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.delete(`/api/users/${userId}`, { headers });
    return response.data;
  }, { defaultError: 'Failed to delete user details', ...options });
}
