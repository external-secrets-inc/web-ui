import { isAxiosError } from "axios";

type AuthErrorType =
  'validation' |      // Field-specific validation failures
  'authentication' |  // Auth-specific failures like invalid credentials
  'api' |             // Other API-returned errors
  'network' |         // Connection issues
  'internal' |        // Internal processing errors
  'unknown';          // Unrecognized errors

interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
  originalError?: unknown;
}

// User-facing error messages
export const AUTH_USER_MESSAGES = {
  DEFAULT: "Something went wrong. Please try again or contact support.",
  INVALID_CREDENTIALS: "Invalid email or password",
  NETWORK_ERROR: "We couldn't reach our servers. Please check your internet connection and try again.",
  TENANT_TAKEN: "Organization URL already taken. Choose another one.",
  TENANT_NOT_FOUND: "Organization not found",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields",
  INVALID_PASSWORD_FORMAT: "Password must contain at least one special character (_!@#$%^&*()-)",
  ORGANIZATION_NOT_FOUND: "Organization '%s' not found. Please verify the URL and try again.",
  ORGANIZATION_NOT_FOUND_GENERIC: "Organization not found. Please verify the URL and try again.",
} as const;

/**
 * Detects specific known error patterns from API responses
 */
function identifyAuthErrorDetails(error: unknown, organizationName?: string): {
  type: AuthErrorType;
  message: string;
  field?: string;
} {
  // Handle non-Axios errors
  if (!isAxiosError(error)) {
    return {
      type: 'unknown',
      message: AUTH_USER_MESSAGES.DEFAULT
    };
  }

  if (!error.response) {
    return {
      type: 'network',
      message: AUTH_USER_MESSAGES.NETWORK_ERROR
    };
  }

  // Handle authentication errors (401)
  if (error.response.status === 401) {
    const apiErrorMessage = error.response?.data?.errors?.error;

    if (typeof apiErrorMessage === 'string' && apiErrorMessage.toLowerCase().includes('invalid tenant')) {
      return {
        type: 'authentication',
        message: organizationName
          ? AUTH_USER_MESSAGES.ORGANIZATION_NOT_FOUND.replace('%s', organizationName)
          : AUTH_USER_MESSAGES.ORGANIZATION_NOT_FOUND_GENERIC,
        field: 'organizationURL'
      };
    }

    return {
      type: 'authentication',
      message: AUTH_USER_MESSAGES.INVALID_CREDENTIALS
    };
  }

  // Handle server errors (500+)
  if (error.response.status >= 500) {
    return {
      type: 'api',
      message: AUTH_USER_MESSAGES.DEFAULT
    };
  }

  const apiErrorMessage = error.response?.data?.errors?.error;
  if (typeof apiErrorMessage !== 'string') {
    return {
      type: 'unknown',
      message: AUTH_USER_MESSAGES.DEFAULT
    };
  }

  if (apiErrorMessage.includes('tenant name already exists')) {
    return {
      type: 'validation',
      message: AUTH_USER_MESSAGES.TENANT_TAKEN,
      field: 'organizationURL'
    };
  }

  if (apiErrorMessage.includes("Field validation for 'Password' failed on the 'password_regex' tag")) {
    return {
      type: 'validation',
      message: AUTH_USER_MESSAGES.INVALID_PASSWORD_FORMAT,
      field: 'password'
    };
  }

  return {
    type: 'api',
    message: AUTH_USER_MESSAGES.DEFAULT
  };
}

export function createAuthError(
  error: unknown,
  field?: string,
  organizationName?: string
): AuthError {
  const errorDetails = identifyAuthErrorDetails(error, organizationName);

  return {
    type: errorDetails.type,
    message: errorDetails.message,
    field: field || errorDetails.field,
    originalError: error
  };
}
