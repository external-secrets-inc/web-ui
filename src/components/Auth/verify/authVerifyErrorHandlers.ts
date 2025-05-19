import { isAxiosError } from "axios";

// User-facing error messages (displayed directly to users)
export const VERIFY_USER_MESSAGES = {
  DEFAULT: "Something went wrong during verification. Please try again or contact support.",
  EXPIRED: "This verification code has expired. Please request a new one.",
  MAX_ATTEMPTS: "Too many incorrect attempts. Please request a new code.",
  INVALID: "Invalid verification code.",
  NETWORK: "Network error. Please check your connection and try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign out and sign in again.",
};

export type VerificationErrorType =
  | 'expired'      // Code has expired
  | 'max_attempts' // Too many incorrect attempts
  | 'invalid'      // Invalid/incorrect code
  | 'network'      // Connection issues
  | 'session'      // Session/auth issues
  | 'unknown';     // Unrecognized errors

export interface VerificationError {
  type: VerificationErrorType;
  message: string;
  originalError?: unknown;
}

function identifyVerificationErrorDetails(error: unknown): {
  type: VerificationErrorType;
  message: string;
} {
  if (isAxiosError(error)) {
    if (!error.response) {
      return {
        type: 'network',
        message: VERIFY_USER_MESSAGES.NETWORK
      };
    }

    const errorMessage = error.response.data?.errors?.error?.toLowerCase() || '';

    if (errorMessage.includes('expired')) {
      return {
        type: 'expired',
        message: VERIFY_USER_MESSAGES.EXPIRED
      };
    }

    if (errorMessage.includes('max attempts')) {
      return {
        type: 'max_attempts',
        message: VERIFY_USER_MESSAGES.MAX_ATTEMPTS
      };
    }

    if (errorMessage.includes('unmatched code')) {
      return {
        type: 'invalid',
        message: VERIFY_USER_MESSAGES.INVALID
      };
    }

    // If it's a session error (401/403)
    if (error.response.status === 401 || error.response.status === 403) {
      return {
        type: 'session',
        message: VERIFY_USER_MESSAGES.SESSION_EXPIRED
      };
    }

    return {
      type: 'unknown',
      message: VERIFY_USER_MESSAGES.DEFAULT
    };
  }

  // Standard JS errors
  if (error instanceof Error) {
    // If it's an Internal error, use default message for user-facing error
    if (error.message.startsWith('[Internal]')) {
      return {
        type: 'unknown',
        message: VERIFY_USER_MESSAGES.DEFAULT
      };
    }
  }

  return {
    type: 'unknown',
    message: VERIFY_USER_MESSAGES.DEFAULT
  };
}

export function createVerificationError(error: unknown): VerificationError {
  const errorDetails = identifyVerificationErrorDetails(error);

  return {
    type: errorDetails.type,
    message: errorDetails.message,
    originalError: error
  };
}
