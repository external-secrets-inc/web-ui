import { ApiHttpError } from '@/types';
import { ListUsersResponse } from '../Users.interface';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';

const listUsers = async (mock: boolean, signal: AbortSignal,): Promise<ListUsersResponse> => {
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

const useListUsers = <T = ListUsersResponse>(
    mock: boolean,
    options?: Omit<UseQueryOptions<ListUsersResponse, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {
    const isMocked = mock;

    return useQuery({
        queryKey: ["useListUsers", isMocked],
        queryFn: ({ signal }) => {
            return listUsers(isMocked, signal)
        },
        ...options,
    });
};

export default useListUsers
