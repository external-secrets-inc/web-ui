import { jwtDecode } from "jwt-decode";
import axiosInstance from '@/services/axiosConfig';
import { getUserData } from "@/services/users/queries/useGetUserData";
import { IUserData } from "@/types"; // Import IUserData

// Interface for Decoded JWT (moved from authHelpers.ts)
export interface DecodedJwt {
  exp: number;
  UserId: string;
  TenantId: string;
  name?: string;
  email?: string;
}

// loginWithGoogle function (moved from authHelpers.ts)
// Updated return type to match actual backend response
export const loginWithGoogle = async (idToken: string, tenant: string): Promise<{ jwt: string, email?: string, name?: string }> => {
  const response = await axiosInstance.post('/public/auth/google', { id_token: idToken, tenant });
  return response.data;
};

// identifyUserAndPrepareState function (moved from authHelpers.ts)
// Updated to return IUserData and map fields accordingly
export const identifyUserAndPrepareState = async (
  token: string,
  tenantSlug: string,
  preferredEmail?: string,
  manualToken?: string
): Promise<IUserData> => { // Changed return type to IUserData
  try {
    // 1. Decode token to get IDs
    const decodedToken = jwtDecode<DecodedJwt>(token);
    const userId = decodedToken.UserId;
    const tenantId = decodedToken.TenantId;

    if (!userId || !tenantId) {
      throw new Error("Failed to extract user or tenant ID from token.");
    }

    // 2. Fetch user details
    const userDetails = await getUserData(userId, manualToken || token);

    // 3. Check if user is active
    if (!userDetails.is_active) {
      throw new Error("User account is inactive.");
    }

    // 4. Prepare user state as IUserData
    const userState: IUserData = {
      email: preferredEmail || userDetails.email,
      name: userDetails.name,
      isActive: userDetails.is_active,
      tenantId: tenantId,
      tenant: tenantSlug, // This corresponds to organizationURL in IUserData if tenantSlug is the org URL
      userId: userId,
      organizationURL: tenantSlug, // Explicitly map to organizationURL
    };

    return userState;

  } catch (error) {
    console.error("Failed during user identification or state preparation:", error);
    if (error instanceof Error) {
      throw new Error(`Identification failed: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during user identification.');
    }
  }
};