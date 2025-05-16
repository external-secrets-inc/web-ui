import { AxiosError } from "axios";
import { ApiHttpError } from "@/types";

/**
 * Common error types that can occur during authentication flows
 */
export type AuthErrorType =
  'validation' |     // Field-specific validation failures
  'authentication' | // Auth-specific failures like invalid credentials
  'api' |            // Other API-returned errors
  'network' |        // Connection issues
  'unknown';         // Unrecognized errors

/**
 * Standardized error structure for auth flows
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
  originalError?: AxiosError<ApiHttpError>;
}

/**
 * Common error messages used across auth flows
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  NETWORK_ERROR: "Network error. Please check your connection",
  UNEXPECTED_ERROR: "An unexpected error occurred",
  TENANT_TAKEN: "Organization URL already taken. Choose another one.",
  TENANT_NOT_FOUND: "Organization not found",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields",
  INVALID_PASSWORD_FORMAT: "Invalid special character. Use only: _!@#$%^&*()-.",
} as const;

/**
 * Detects specific known error patterns from API responses
 */
function identifyAuthErrorDetails(error: unknown): {
  type: AuthErrorType;
  message: string;
  field?: string;
} {
  if (!(error instanceof AxiosError)) {
    return {
      type: 'unknown',
      message: AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }

  if (!error.response) {
    return {
      type: 'network',
      message: AUTH_ERROR_MESSAGES.NETWORK_ERROR
    };
  }

  if (error.response.status === 401) {
    return {
      type: 'authentication',
      message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
    };
  }

  const apiErrorMessage = error.response?.data?.errors?.error;
  if (typeof apiErrorMessage !== 'string') {
    return {
      type: 'unknown',
      message: AUTH_ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }

  if (apiErrorMessage.includes('tenant name already exists')) {
    return {
      type: 'validation',
      message: AUTH_ERROR_MESSAGES.TENANT_TAKEN,
      field: 'organizationURL'
    };
  }

  if (apiErrorMessage.includes("Field validation for 'Password' failed on the 'password_regex' tag")) {
    return {
      type: 'validation',
      message: AUTH_ERROR_MESSAGES.INVALID_PASSWORD_FORMAT,
      field: 'password'
    };
  }

  return {
    type: 'api',
    message: apiErrorMessage
  };
}

/**
 * Creates a standardized auth error object with intelligent error detection
 */
export function createAuthError(
  error: unknown,
  field?: string
): AuthError {
  const errorDetails = identifyAuthErrorDetails(error);

  return {
    type: errorDetails.type,
    message: errorDetails.message,
    field: field || errorDetails.field,
    originalError: error instanceof AxiosError ? error : undefined
  };
}