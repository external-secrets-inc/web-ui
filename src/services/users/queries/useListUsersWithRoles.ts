import { ApiHttpError } from '@/types';
import { ListUsersWithRolesResponse } from '../Users.interface';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';

const listUsersWithRoles = async (mock: boolean, signal: AbortSignal,): Promise<ListUsersWithRolesResponse> => {
    if (mock) {
        return {
            "users": [],
        };
    }

    const headers = await getAuthHeaders();
    const response = await axiosInstance.get(`/api/users-roles/`, {
        headers,
        signal,
    });
    return response.data;
};

const useListUsersWithRoles = <T = ListUsersWithRolesResponse>(
    mock: boolean,
    options?: Omit<UseQueryOptions<ListUsersWithRolesResponse, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
    const isMocked = mock;

    return useQuery({
        queryKey: ["useListUsersWithRoles", isMocked],
        queryFn: ({ signal }) => {
            return listUsersWithRoles(isMocked, signal)
        },
        ...options,
    });
};

export default useListUsersWithRoles
