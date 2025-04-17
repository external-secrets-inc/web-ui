import { LoginAndIdentifyParams } from "@/services/auth/Auth.interfaces";
import { performLogin } from "@/services/auth/mutations/userPerformLogin";
import { getUserData } from "@/services/users/usersService";
import { ApiHttpError } from "@/types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

const buildUserState = ({
  email,
  name,
  userDetails,
  tenantId,
  tenant,
  userId,
}: {
  email: string;
  name?: string;
  userDetails: Awaited<ReturnType<typeof getUserData>>;
  tenantId: string;
  tenant: unknown;
  userId: string;
}) => {
  return {
    email,
    name: name || userDetails.name,
    isActive: userDetails.is_active,
    tenantId,
    tenant,
    userId,
  };
};

const signInUser = (
  authKitSignIn: LoginAndIdentifyParams["authKitSignIn"],
  token: string,
  userState: Record<string, unknown>
) => {
  return authKitSignIn({
    auth: {
      token,
      type: "Bearer",
    },
    userState,
  });
};

const identifyUserWithAnalytics = (userState: Record<string, unknown>) => {
  const { userId, email, name, ...segmentUserState } = userState; // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    analytics.identify(userId as string, segmentUserState);
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
}: LoginAndIdentifyParams): Promise<boolean> => {
  const { token, tenantId, tenant, userId } = await performLogin({email, password, tenant: tenantSlug});
  const userDetails = await getUserData(userId!, { manualToken: token });
  
  const userState = buildUserState({
    email,
    name,
    userDetails,
    tenantId,
    tenant,
    userId: userId!,
  });
  
  const isSignedIn = signInUser(authKitSignIn, token, userState);
  
  if (isSignedIn) {
    identifyUserWithAnalytics(userState);
    return true;
  }
  
  return false;
};


const useLoginAndIdentifyUser = (
  options?: Omit<UseMutationOptions<boolean, AxiosError<ApiHttpError>, LoginAndIdentifyParams>, 'mutationKey' | 'mutationFn'>
) => {

  return useMutation({
    mutationKey: ["useLoginAndIdentifyUser"],
    mutationFn: (variables: LoginAndIdentifyParams) => loginAndIdentifyUser(variables),
    ...options,
  });
};

export default useLoginAndIdentifyUser;
