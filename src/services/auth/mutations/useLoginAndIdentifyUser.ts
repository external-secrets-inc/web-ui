import { LoginAndIdentifyParams } from "@/services/auth/Auth.interfaces";
import { performLogin } from "@/services/auth/mutations/usePerformLogin";
import { getUserData } from "@/services/users/queries/useGetUserData";
import { ApiHttpError, IUserData } from "@/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface LoginResult {
  isSignedIn: boolean;
  userState: IUserData;
}

const buildUserState = ({
  email,
  name,
  userDetails,
  tenantId,
  tenantSlug,
  userId,
}: {
  email: string;
  name?: string;
  userDetails: Awaited<ReturnType<typeof getUserData>>;
  tenantId: string;
  tenantSlug: string;
  userId: string;
}): IUserData => ({
  email,
  name: name || userDetails.name,
  isActive: userDetails.is_active,
  tenantId,
  tenant: tenantSlug,
  organizationURL: tenantSlug,
  userId,
});

const signInUser = (
  authKitSignIn: LoginAndIdentifyParams["authKitSignIn"],
  token: string,
  userState: IUserData
): boolean => authKitSignIn({
  auth: {
    token,
    type: "Bearer",
  },
  userState,
});

const identifyUserWithAnalytics = (userState: IUserData): void => {
  const { userId, organizationURL, tenantId } = userState;
  const traits = {
    organizationURL,
    tenantId,
  };
  try {
    if (typeof analytics !== 'undefined' && analytics.identify) {
      analytics.identify(userId, traits);
    } else {
      console.warn("Segment analytics.identify not available.");
    }
  } catch (error) {
    console.error("Segment identify call failed:", error);
  }
};

const loginAndIdentifyUser = async ({
  email,
  password,
  tenantSlug,
  name,
  authKitSignIn,
}: LoginAndIdentifyParams): Promise<LoginResult> => {
  const { token, tenantId, tenant: returnedTenantSlug, userId } = await performLogin({ email, password, tenant: tenantSlug });

  if (!userId) {
    throw new Error("Login failed: No user ID returned");
  }

  const userDetails = await getUserData(userId, token);
  const userState = buildUserState({
    email,
    name,
    userDetails,
    tenantId,
    tenantSlug: returnedTenantSlug,
    userId,
  });

  const isSignedIn = signInUser(authKitSignIn, token, userState);

  if (isSignedIn) {
    identifyUserWithAnalytics(userState);
  }

  return { isSignedIn, userState };
};

const useLoginAndIdentifyUser = (
  options?: Omit<UseMutationOptions<LoginResult, AxiosError<ApiHttpError>, LoginAndIdentifyParams>, 'mutationKey' | 'mutationFn'>
) => useMutation({
  mutationKey: ["auth", "useLoginAndIdentifyUser"],
  mutationFn: loginAndIdentifyUser,
  ...options,
});

export default useLoginAndIdentifyUser;
