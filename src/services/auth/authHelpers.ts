import { login } from "@/services/auth/authService";
import { getUserData } from "@/services/users/queries/useGetUserData";
import useSignIn from "react-auth-kit/hooks/useSignIn";

export async function getAuthHeaders(manualToken?: string): Promise<{ [key: string]: string }> {
  const token = manualToken || await getTokenFromCookies();
  if (!token) {
    // We still set the cookie even if the token is null. It will be invalidated
    // with Auth Kit UseSignOut on any 401 request and redirect to login using
    // Axios interceptor.
    console.error('Authentication token not found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function getTokenFromCookies(maxRetries = 20, delay = 200): Promise<string | null> {
  const authCookieName = '_auth';

  // TODO: Trying this to see if it fixes the issue with the cookie not being
  // found right after login. We should have a better solution for this or at
  // least allow an easy way to define a loading state.
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${authCookieName}=`);
    const token = parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
    if (token) {
      return token;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return null;
}

interface LoginAndIdentifyParams {
  email: string;
  password: string;
  tenantSlug: string;
  name?: string;
  authKitSignIn: ReturnType<typeof useSignIn>;
}

export const loginAndIdentifyUser = async ({
  email,
  password,
  tenantSlug,
  name,
  authKitSignIn,
}: LoginAndIdentifyParams): Promise<boolean> => {
  try {
    const { token, tenantId, tenant, userId } = await login(email, password, tenantSlug, { suppressToast: true });

    const userDetails = await getUserData(userId!, token);

    const userState = {
      email,
      name: name || userDetails.name,
      isActive: userDetails.is_active,
      tenantId,
      tenant,
      userId,
    };

    const isSignedIn = authKitSignIn({
      auth: {
        token,
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
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
};
