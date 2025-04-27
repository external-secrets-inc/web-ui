import { getUserData } from "@/services/users/queries/useGetUserData";
import { jwtDecode } from "jwt-decode";
import axiosInstance from '@/services/axiosConfig'; // Corrected path

// Restored Interfaces
export interface DecodedJwt {
  exp: number;
  UserId: string;
  TenantId: string;
  name?: string;
  email?: string;
}

export interface UserAuthState {
  email: string;
  name: string;
  isActive: boolean;
  tenantId: string;
  tenant: string;
  userId: string;
}

// Added back loginWithGoogle function (previously in authService.ts)
// Updated return type to match actual backend response
export const loginWithGoogle = async (idToken: string, tenant: string): Promise<{ jwt: string, email?: string, name?: string }> => {
  const response = await axiosInstance.post('/public/auth/google', { id_token: idToken, tenant });
  return response.data;
};

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

// Restored identifyUserAndPrepareState function
export const identifyUserAndPrepareState = async (
  token: string,
  tenantSlug: string,
  preferredEmail?: string,
  manualToken?: string
): Promise<UserAuthState> => {
  try {
    // 1. Decode token to get IDs
    const decodedToken = jwtDecode<DecodedJwt>(token);
    const userId = decodedToken.UserId;
    const tenantId = decodedToken.TenantId;

    if (!userId || !tenantId) {
      throw new Error("Failed to extract user or tenant ID from token.");
    }

    // 2. Fetch user details using the provided token (manual or from header)
    // NOTE: Assuming getUserData is available and correctly imported/defined elsewhere
    const userDetails = await getUserData(userId, manualToken || token);

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
    // Consider more specific error handling or re-throwing a custom error
    if (error instanceof Error) {
        // If it's a standard Error, re-throw it or wrap it
        throw new Error(`Identification failed: ${error.message}`);
    } else {
        // Handle cases where the error is not an Error object
        throw new Error('An unknown error occurred during user identification.');
    }
  }
};