/// <reference types="@types/google.accounts" />

import { useCallback } from 'react';

// Define the Google client ID from environment variables
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!clientId) {
  // Potentially throw an error or use a default, depending on desired handling
}

let scriptLoaded = false;

// Loads the Google Identity Services script if not already loaded
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity-script';
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      document.body.removeChild(script);
      reject(new Error('Failed to load Google Identity script'));
    };
    document.body.appendChild(script);
  });
}

// Returns a function that triggers the Google One Tap or popup and resolves with the ID token
export function useGoogleIdentity() {
  const getGoogleIdToken = useCallback(async (): Promise<string | null> => {
    try {
      await loadGoogleScript();

      return new Promise((resolve, reject) => {
        // @ts-ignore
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
          reject(new Error('Google Identity Services not available'));
          return;
        }

        const config = {
          client_id: clientId,
          callback: (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('Google Sign-In failed: No credential returned.'));
            }
          },
          error_callback: (error: any) => {
            reject(new Error(`Google Sign-In initialization/prompt error: ${error?.type || 'Unknown error'}`));
          },
          cancel_on_tap_outside: true,
          // Add any other necessary config options here
        };

        // @ts-ignore
        window.google.accounts.id.initialize(config);

        try {
          // @ts-ignore
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              reject(new Error(`Google One Tap prompt not displayed: ${notification.getNotDisplayedReason()}`));
            } else if (notification.isSkippedMoment()) {
              reject(new Error(`Google One Tap prompt skipped: ${notification.getSkippedReason()}`));
            } else if (notification.isDismissedMoment()) {
              reject(new Error(`Google One Tap prompt dismissed by user: ${notification.getDismissedReason()}`));
            }
          });
        } catch (promptError) {
          reject(promptError);
        }
      });
    } catch (error) {
      return Promise.reject(error); // Re-reject top-level errors
    }
  }, [clientId]);

  /**
   * Initializes the Google Sign-In button and renders it into a container element.
   * @param parentElement The parent HTMLElement where the button should be rendered.
   * @param onTokenReceived Callback function to handle the received credential response.
   * @param onError Callback function to handle errors.
   */
  const renderGoogleButton = async (
    parentElement: HTMLElement,
    onTokenReceived: (credentialResponse: google.accounts.id.CredentialResponse) => void,
    onError: (error: any) => void,
  ) => {
    try {
      await loadGoogleScript();

      // @ts-ignore
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        throw new Error('Google Identity Services not available');
      }

      // Initialize - This might be redundant if already called, but safe to call again.
      // Consider managing initialization state if this hook is used in multiple places.
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: google.accounts.id.CredentialResponse) => {
          onTokenReceived(response);
        },
        // Add other configurations if needed (e.g., ux_mode, login_uri)
      });

      if (!parentElement) {
        throw new Error(`Parent element provided is null or invalid`);
      }

      // @ts-ignore
      window.google.accounts.id.renderButton(
        parentElement, // The element to render the button into
        { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with' } // Button configuration
      );

    } catch (error) {
      onError(error);
    }
  };

  return { getGoogleIdToken, renderGoogleButton };
}
