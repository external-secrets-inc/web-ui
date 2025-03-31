import { ApiHttpError } from '@/types';
import { GetUserWithRolesResponse } from '../Users.interface';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';

const getUserWithRoles = async (mock: boolean, user_id: string, signal: AbortSignal,): Promise<GetUserWithRolesResponse> => {
    if (mock) {
        return {
            "id": "string",
            "name": "string",
            "email": "string",
            "is_active": true,
            "roles": [],
        };
    }

    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/api/users-roles/${user_id}`, {
        headers,
        signal,
    });
    return response.data;
};

const useGetUserWithRoles = <T = GetUserWithRolesResponse>(
    mock: boolean,
    user_id: string,
    options?: Omit<UseQueryOptions<GetUserWithRolesResponse, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
    const isMocked = mock;

    return useQuery({
        queryKey: ["useGetUserWithRoles", isMocked],
        queryFn: ({ signal }) => {
            return getUserWithRoles(isMocked, user_id, signal)
        },
        ...options,
    });
};

export default useGetUserWithRoles
