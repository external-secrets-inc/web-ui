import { trackSignedIn } from "@/analytics";
import { getTenantIdFromToken, getUserIdFromToken } from "@/lib/utils";
import { useLoginWithGoogleMutation } from "@/services/auth/mutations/useLoginWithGoogleMutation";
import { getUserData } from "@/services/users/queries/useGetUserData";
import { IUserData } from "@/types";
import { CredentialResponse } from '@react-oauth/google';
import { Step } from "@stepperize/react";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  GOOGLE_LOGIN_CONSOLE_MESSAGES,
  GOOGLE_LOGIN_INTERNAL_MESSAGES,
  GOOGLE_LOGIN_USER_MESSAGES,
  createGoogleAuthError
} from "./authLoginWithGoogleErrorHandlers";

interface GoogleIdTokenPayload {
  email?: string;
  name?: string;
  sub: string;
}

interface UseAuthLoginWithGoogleProps {
  currentStep: Step;
  form: UseFormReturn<LoginFormShape>;
}

interface LoginFormShape {
  organizationURL: string;
  email: string;
  password: string;
}

/**
 * @internal
 * Processes the backend application token to fetch user details and prepare the user state for react-auth-kit.
 * This function is co-located as it's specific to the Google login flow's needs after a backend token is obtained.
 * @param backendToken The application-specific JWT received from the backend.
 * @param tenantSlug The organization slug (URL identifier).
 * @param preferredEmail Optional email obtained from the Google ID token, used as a fallback.
 * @returns A promise that resolves to the IUserData object for react-auth-kit.
 * @throws An error if user/tenant ID cannot be extracted, user is inactive, or other processing fails.
 */
async function _identifyUserAndPrepareState(
  backendToken: string,
  tenantSlug: string,
  preferredEmail?: string
): Promise<IUserData> {
  try {
    const userId = getUserIdFromToken(backendToken);
    const tenantId = getTenantIdFromToken(backendToken);

    if (!userId || !tenantId) {
      throw new Error(GOOGLE_LOGIN_INTERNAL_MESSAGES.TOKEN_EXTRACTION_FAILURE);
    }

    const userDetails = await getUserData(userId, backendToken);

    if (!userDetails.is_active) {
      throw new Error(GOOGLE_LOGIN_INTERNAL_MESSAGES.USER_INACTIVE);
    }

    return {
      email: preferredEmail || userDetails.email,
      name: userDetails.name,
      isActive: userDetails.is_active,
      tenantId: tenantId,
      tenant: tenantSlug,
      userId: userId,
      organizationURL: tenantSlug,
    };
  } catch (error) {
    console.error(
      GOOGLE_LOGIN_CONSOLE_MESSAGES.IDENTIFY_USER_STATE_FAILURE,
      error
    );

    if (error instanceof Error) {
      throw new Error(GOOGLE_LOGIN_INTERNAL_MESSAGES.USER_DATA_PREPARATION_FAILURE.replace('%s', error.message));
    }

    throw new Error(GOOGLE_LOGIN_INTERNAL_MESSAGES.UNKNOWN_USER_DATA_ERROR);
  }
}

/**
 * Manages the Google Sign-In flow after a Google ID token is received from the client-side Google login.
 * This hook orchestrates calling the backend to exchange the Google ID token for an application JWT,
 * then prepares user data and signs the user into the application using react-auth-kit.
 * It handles loading states and consolidates errors from various steps into a single displayable error message.
 *
 * @param props The properties required by the hook, including the current stepper step and react-hook-form instance.
 * @returns An object containing:
 *  - `handleGoogleTokenResponse`: Function to call with Google's `CredentialResponse`.
 *  - `isGoogleLoading`: Boolean indicating if the overall Google login process is in progress.
 *  - `googleError`: A user-friendly error message string if any part of the process fails, otherwise null.
 */
export function useAuthLoginWithGoogle({
  currentStep,
  form,
}: UseAuthLoginWithGoogleProps) {
  const [processError, setProcessError] = useState<string | null>(null);
  const [attemptedTenantSlug, setAttemptedTenantSlug] = useState<string | null>(null);
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();

  const {
    mutateAsync: loginWithGoogleMutate,
    isPending: isApiLoginLoading,
    error: apiLoginErrorObject,
    reset: resetMutation,
  } = useLoginWithGoogleMutation();

  useEffect(
    function clearErrorOnStepChange() {
      setProcessError(null);
    },
    [currentStep.id]
  );

  useEffect(
    function transformApiErrorToUserFriendlyMessage() {
      if (!apiLoginErrorObject) return;

      const authError = createGoogleAuthError(apiLoginErrorObject, attemptedTenantSlug ?? undefined);
      setProcessError(authError.message);
    },
    [apiLoginErrorObject, attemptedTenantSlug]
  );

  const handleGoogleTokenResponse = useCallback(
    async (credentialResponse: CredentialResponse) => {
      setProcessError(null);
      resetMutation();
      setAttemptedTenantSlug(null);

      const { credential: googleIdToken } = credentialResponse;
      if (!googleIdToken) {
        setProcessError(GOOGLE_LOGIN_USER_MESSAGES.NO_ID_TOKEN);
        return;
      }

      const formData = form.getValues();
      let tenantSlug = String(formData.organizationURL);

      // Validate organization URL
      if (currentStep.id === 'organizationURL' || !tenantSlug) {
        const isValidOrg = await form.trigger(['organizationURL']);
        if (!isValidOrg) {
          setProcessError(GOOGLE_LOGIN_USER_MESSAGES.MISSING_ORG_URL);
          return;
        }
        tenantSlug = String(form.getValues().organizationURL);
        if (!tenantSlug) {
          setProcessError(GOOGLE_LOGIN_USER_MESSAGES.ORG_VALIDATION_FAILURE);
          return;
        }
      }

      setAttemptedTenantSlug(tenantSlug);

      try {
        // Extract email from Google ID token as fallback for user identification
        let preferredEmail: string | undefined;
        try {
          const decodedGoogleToken = jwtDecode<GoogleIdTokenPayload>(googleIdToken);
          preferredEmail = decodedGoogleToken.email;
        } catch (e) {
          console.warn(GOOGLE_LOGIN_CONSOLE_MESSAGES.DECODE_TOKEN_FAILURE, e);
        }

        // Exchange Google ID token for an application-specific JWT from the backend.
        const backendResponse = await loginWithGoogleMutate({ idToken: googleIdToken, tenant: tenantSlug });
        const backendAppToken = backendResponse.jwt;

        // Using the application JWT, fetch full user details and prepare state for react-auth-kit.
        const userState = await _identifyUserAndPrepareState(
          backendAppToken,
          tenantSlug,
          preferredEmail
        );

        // Complete the sign-in process using react-auth-kit.
        const isSignedIn = authKitSignIn({
          auth: { token: backendAppToken, type: 'Bearer' },
          userState: userState,
        });

        if (isSignedIn) {
          trackSignedIn(tenantSlug);
          navigate('/');
        } else {
          setProcessError(GOOGLE_LOGIN_USER_MESSAGES.REACT_AUTH_KIT_FAILURE);
        }
      } catch (error: unknown) {
        // Handle errors that occur outside the API call
        if (!apiLoginErrorObject) {
          const authError = createGoogleAuthError(error, tenantSlug);
          setProcessError(authError.message);
        } else if (error instanceof Error && processError !== error.message) {
          console.warn(
            GOOGLE_LOGIN_CONSOLE_MESSAGES.DUAL_ERROR_SCENARIO.replace('%s', error.message).replace('%s', processError || '')
          );
        }
        console.error(GOOGLE_LOGIN_CONSOLE_MESSAGES.PROCESS_ERROR_DETAILS, error);
      }
    },
    [currentStep, form, authKitSignIn, navigate, loginWithGoogleMutate, resetMutation, apiLoginErrorObject, processError]
  );

  const isLoading = isApiLoginLoading;
  const displayError = processError;

  return {
    handleGoogleTokenResponse,
    isGoogleLoading: isLoading,
    googleError: displayError,
  };
}