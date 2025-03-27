import { getAuthHeaders } from '@/services/auth/authHelpers';
import { apiWrapper } from '@/services/servicesHelpers';
import { ApiWrapperOptions, ApiHttpError } from '@/types';
import axiosInstance from '../axiosConfig';
import { CreateUserDataPayload, ListUsersResponse, UpdateUserDataPayload } from './Users.interface';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";


// Fetch user data
export async function getUserData(userId: string, options: Partial<ApiWrapperOptions & { manualToken?: string }> = {}) {
  const headers = await getAuthHeaders(options.manualToken);

  return apiWrapper(async () => {
    const response = await axiosInstance.get(`/api/users/${userId}`, { headers });
    return response.data;
  }, { defaultError: 'Failed to fetch user details', ...options });
}

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

// Get users
const listUsersData = async (mock: boolean, signal: AbortSignal,): Promise<ListUsersResponse> => {
  if (mock) {
    return {
      "users": [],
    };
  }

  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/api/users/`, {
    headers,
    signal,
  });
  return response.data;
};

export const useListUsersData = <T = ListUsersResponse>(
  mock: boolean,
  options?: Omit<UseQueryOptions<ListUsersResponse, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
  const isMocked = mock;

  return useQuery({
    queryKey: ["useListUsersData", isMocked],
    queryFn: ({ signal }) => {
      return listUsersData(isMocked, signal)
    },
    ...options,
  });
};
