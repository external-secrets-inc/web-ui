import React, { useEffect, useRef, useState } from 'react';
import { CredentialResponse } from '@react-oauth/google'; 

interface GoogleSignInButtonRendererProps {
  onTokenReceived: (tokenResponse: CredentialResponse) => void; 
  onError: (error: any) => void;
} 

export const GoogleSignInButtonRenderer: React.FC<GoogleSignInButtonRendererProps> = ({ onTokenReceived, onError }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); 

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true); 
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Identity Services script:', error);
      onError(error); 
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      // Also potentially remove the Google Sign-In button/iframe if necessary
      // google?.accounts?.id?.cancel(); 
    };
  }, [onError]); 

  useEffect(() => {
    if (!isScriptLoaded || !ref.current) {
      return; 
    }

    if (typeof window.google === 'undefined' || typeof window.google.accounts === 'undefined' || typeof window.google.accounts.id === 'undefined') {
      console.error('Google Identity Services library not available.');
      onError('Google Identity Services library not available.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: (credentialResponse: CredentialResponse) => {
          onTokenReceived(credentialResponse);
        },
        error_callback: (error: any) => {
          console.error('Google Sign-In error_callback:', error);
          onError(error?.message || 'Google Sign-In failed during initialization or callback.');
        },
      });

      window.google.accounts.id.renderButton(
        ref.current, 
        { 
          theme: 'outline',
          size: 'large',
          type: 'standard', 
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        } 
      );

    } catch (err) {
      console.error('Error initializing or rendering Google button:', err);
      onError(err instanceof Error ? err.message : 'An unknown error occurred during Google Sign-In setup.');
    }

  }, [isScriptLoaded, onTokenReceived, onError]); 

  return (
    <div ref={ref} id="google-signin-button-container" className="w-full flex justify-center">
      {/* This div will be populated by the Google script */} 
    </div>
  );
};

export default GoogleSignInButtonRenderer;
