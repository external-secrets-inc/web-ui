import { isAxiosError } from "axios";

// User-facing error messages (displayed directly to users)
export const GOOGLE_LOGIN_USER_MESSAGES = {
  DEFAULT: "Something went wrong during Google Login. Please try again or contact support.",
  UNKNOWN_ERROR: "We couldn't complete the Google Login process. Please try again or contact support.",
  UNAUTHORIZED: "This Google account doesn't seem to be registered with the '%s' Organization. Please change the Organization URL or use a different Google account.",
  UNAUTHORIZED_GENERIC: "This Google account doesn't seem to be registered with the specified Organization. Please verify the Organization URL or use a different Google account.",
  MISSING_ORG_URL: "Please enter your Organization URL before proceeding with Google Login.",
  SERVER_COMMUNICATION_FAILURE: "We couldn't reach our servers. Please check your internet connection and try again.",
  NO_ID_TOKEN: "Unable to authenticate with Google. Please try again.",
  ORG_VALIDATION_FAILURE: "Unable to validate your Organization URL. Please check your input and try again.",
  REACT_AUTH_KIT_FAILURE: "Authentication was successful, but we couldn't complete the login process. Please try again.",
};

// Internal error messages (used in thrown errors or internal processing)
export const GOOGLE_LOGIN_INTERNAL_MESSAGES = {
  USER_INACTIVE: "[Internal] User account is inactive and cannot be logged in.",
  USER_DATA_PREPARATION_FAILURE: "[Internal] User data preparation failed: %s",
  UNKNOWN_USER_DATA_ERROR: "[Internal] Unknown error in user data preparation flow",
  TOKEN_EXTRACTION_FAILURE: "[Internal] Failed to extract user or tenant ID from token",
};

// Console log messages
export const GOOGLE_LOGIN_CONSOLE_MESSAGES = {
  DECODE_TOKEN_FAILURE: "Could not decode Google ID token to get preferred email:",
  DUAL_ERROR_SCENARIO: "Further error after API call during Google Login: %s. Keeping initial API error message: %s",
  PROCESS_ERROR_DETAILS: "Google Login Process Error (details):",
  IDENTIFY_USER_STATE_FAILURE: "Error in _identifyUserAndPrepareState:",
};

/**
 * Common error types that can occur during Google authentication
 */
type GoogleAuthErrorType =
  'api' |             // API-returned errors
  'authentication' |  // Auth-specific failures
  'network' |         // Connection issues
  'internal' |        // Internal processing errors
  'unknown';          // Unrecognized errors

/**
 * Basic error type for Google auth
 */
export interface GoogleAuthError {
  type: GoogleAuthErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * Detects specific known error patterns from Google auth responses
 */
function identifyGoogleAuthErrorDetails(error: unknown, organizationName?: string): {
  type: GoogleAuthErrorType;
  message: string;
} {
  // Handle Axios errors from API
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    const apiResponseBody = responseData?.errors?.body || responseData?.error;

    // Authentication failure (401), usually due to mismatched organization URL or Google account not registered with the organization
    if (error.response?.status === 401) {
      if (typeof apiResponseBody === 'string' && apiResponseBody.includes("You need to be logged in")) {
        return {
          type: 'authentication',
          message: organizationName
            ? GOOGLE_LOGIN_USER_MESSAGES.UNAUTHORIZED.replace('%s', organizationName)
            : GOOGLE_LOGIN_USER_MESSAGES.UNAUTHORIZED_GENERIC
        };
      }
    }

    if (typeof apiResponseBody === 'string' && apiResponseBody.trim() !== "") {
      return {
        type: 'api',
        message: apiResponseBody
      };
    }

    if (!error.response) {
      return {
        type: 'network',
        message: GOOGLE_LOGIN_USER_MESSAGES.SERVER_COMMUNICATION_FAILURE
      };
    }

    return {
      type: 'api',
      message: GOOGLE_LOGIN_USER_MESSAGES.DEFAULT
    };
  }

  // Standard JS errors
  if (error instanceof Error) {
    // If it's an Internal error (prefixed with [Internal]), use default message for user-facing error
    if (error.message.startsWith('[Internal]')) {
      return {
        type: 'internal',
        message: GOOGLE_LOGIN_USER_MESSAGES.DEFAULT
      };
    }

    return {
      type: 'unknown',
      message: error.message || GOOGLE_LOGIN_USER_MESSAGES.DEFAULT
    };
  }

  return {
    type: 'unknown',
    message: GOOGLE_LOGIN_USER_MESSAGES.UNKNOWN_ERROR
  };
}

/**
 * Creates a standardized Google auth error object from various error types.
 * Ensures that Internal errors are converted to user-friendly messages.
 */
export function createGoogleAuthError(error: unknown, organizationName?: string): GoogleAuthError {
  const errorDetails = identifyGoogleAuthErrorDetails(error, organizationName);

  return {
    type: errorDetails.type,
    message: errorDetails.message,
    originalError: error
  };
}