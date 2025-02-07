import useSignIn from "react-auth-kit/hooks/useSignIn";
import { getUserData } from "@/services/users/usersService";
import useLogin from "./useLogin";
import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

interface UseLoginWithIdentificationParams {
  onSuccess?: () => void;
  onError?: (error: AxiosError<ApiHttpError>) => void;
}

interface LoginParams {
  email: string;
  password: string;
  tenantSlug: string;
  name?: string;
}

interface UserState {
  email: string;
  name: string;
  isActive: boolean;
  tenantId: string | null;
  tenant: string;
  userId: string | null;
}

export const useLoginWithIdentification = ({ 
  onSuccess, 
  onError 
}: UseLoginWithIdentificationParams = {}) => {
  const authKitSignIn = useSignIn();
  const loginMutation = useLogin({
    onSuccess: (loginData, variables) => {
      return (async () => {
        try {
          if (!loginData.userId) {
            throw new Error("User ID is required");
          }
          const userDetails = await getUserData(loginData.userId, { manualToken: loginData.token });

          const userState: UserState = {
            email: variables.email,
            name: userDetails.name,
            isActive: userDetails.is_active,
            tenantId: loginData.tenantId,
            tenant: loginData.tenant,
            userId: loginData.userId,
          };

          const isSignedIn = authKitSignIn({
            auth: {
              token: loginData.token,
              type: "Bearer",
            },
            userState,
          });

          if (isSignedIn) {
            // Remove sensitive data and pass the rest to Segment
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { userId, email, name, ...segmentUserState } = userState;
            try {
              analytics.identify(userId as string, segmentUserState);
            } catch (error) {
              console.error("Segment identify call failed:", error);
            }
            onSuccess?.();
            return true;
          }

          throw new Error("Failed to sign in with auth kit");
        } catch (error) {
          if (error instanceof AxiosError) {
            onError?.(error);
          }
          throw error;
        }
      })();
    },
    onError,
  });

  const login = async (params: LoginParams) => {
    return loginMutation.mutateAsync({
      email: params.email,
      password: params.password,
      tenant: params.tenantSlug,
    });
  };

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};