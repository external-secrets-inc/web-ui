import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useAuthSignOut from 'react-auth-kit/hooks/useSignOut';
import { trackSignedOut } from '@/analytics';

export type SignOutReason =
  | 'manual' // User clicked sign out
  | 'session_expired' // 401 from server
  | 'account_deleted' // Organization deleted
  | 'forced' // Admin forced sign out or other system events

interface SignOutOptions {
  reason: SignOutReason;
}

/**
 * A unified hook for handling user sign out across the application.
 * Ensures consistent cleanup of application state and proper tracking.
 *
 * @example
 * // In a component
 * useSignOut()({ reason: 'manual' });
 *
 * // In an event handler
 * const handleClick = () => useSignOut()({ reason: 'manual' });
 *
 * // For session expiry
 * if (isExpired) useSignOut()({ reason: 'session_expired' });
 */
export const useSignOut = () => {
  const authSignOut = useAuthSignOut();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Return a function that can be immediately invoked
  return ({ reason }: SignOutOptions) => {
    // Clear all react-query cache
    queryClient.clear();

    // Sign out from auth-kit
    authSignOut();

    // Track the sign out event with proper context
    const isManual = reason === 'manual';
    trackSignedOut(isManual);

    // Clear any sensitive data from localStorage
    localStorage.removeItem('lastCodeRequestedAt');
    // Add any other app-specific localStorage cleanup here

    // Navigate to login page
    navigate('/login', { replace: true });
  };
};