<<<<<<< Updated upstream
=======
import { login } from "@/services/auth/authService";
import { getUserData } from "@/services/users/usersService";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { jwtDecode } from "jwt-decode";

interface DecodedJwt {
  exp: number;
  UserId: string;
  TenantId: string;
  name?: string;
  email?: string;
}

interface UserAuthState {
  email?: string;
  name?: string;
  isActive: boolean;
  tenantId: string;
  tenant: string;
  userId: string;
}

interface LoginAndIdentifyParams {
  email: string;
  password: string;
  tenantSlug: string;
  name?: string;
  authKitSignIn: ReturnType<typeof useSignIn>;
}

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}
=======
}

export const identifyUserAndPrepareState = async (
  token: string,
  tenantSlug: string,
  preferredEmail?: string
): Promise<UserAuthState> => {
  try {
    // 1. Decode token to get IDs
    const decodedToken = jwtDecode<DecodedJwt>(token);
    const userId = decodedToken.UserId;
    const tenantId = decodedToken.TenantId;

    if (!userId || !tenantId) {
      throw new Error("Failed to extract user or tenant ID from token.");
    }

    // 2. Fetch user details using the token
    const userDetails = await getUserData(userId, { manualToken: token });

    // 3. Check if user is active
    if (!userDetails.is_active) {
      // Throw a specific error type or message that the caller can catch
      throw new Error("User account is inactive.");
    }

    // 4. Prepare user state
    const userState: UserAuthState = {
      email: preferredEmail || userDetails.email, // Use preferred email if provided
      name: userDetails.name,
      isActive: userDetails.is_active,
      tenantId: tenantId,
      tenant: tenantSlug, // Use the slug passed in (consistent with standard login)
      userId: userId,
    };

    return userState;

  } catch (error) {
    console.error("Failed during user identification or state preparation:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

export const loginAndIdentifyUser = async ({
  email,
  password,
  tenantSlug,
  name,
  authKitSignIn,
}: LoginAndIdentifyParams): Promise<boolean> => {
  try {
    const { token, tenantId, tenant, userId } = await login(email, password, tenantSlug, { suppressToast: true });

    const userDetails = await getUserData(userId!, { manualToken: token });

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
>>>>>>> Stashed changes
