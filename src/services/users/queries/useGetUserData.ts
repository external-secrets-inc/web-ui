import { ApiHttpError } from '@/types';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';
import { UserData } from '@/services/users/Users.interface';

export const getUserData = async (userId: string, manualToken?: string, signal?: AbortSignal): Promise<UserData> => {
    const headers = await getAuthHeaders(manualToken);
    const response = await axiosInstance.get(`/api/users/${userId}`, { headers, signal });
    return response.data;
};

const useGetUserData = <T = UserData>(
    userId: string,
    options?: Omit<UseQueryOptions<UserData, AxiosError<ApiHttpError>, T>, 'queryKey' | 'queryFn'>
) => {

    return useQuery({
        queryKey: ["useGetUserData", userId],
        queryFn: ({ signal }) => {
            return getUserData(userId, undefined, signal)
        },
        ...options,
    });
};

export default useGetUserData
