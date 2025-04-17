import { ApiHttpError } from '@/types';
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { getAuthHeaders } from '@/services/auth/authHelpers';
import axiosInstance from '@/services/axiosConfig';
import { UserData } from '@/services/users/Users.interface';

export const getUserData = async (signal: AbortSignal | undefined, userId: string, manualToken?: string): Promise<UserData> => {
    console.log("manualToken", manualToken)
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
            return getUserData(signal, userId)
        },
        ...options,
    });
};

export default useGetUserData
