import React, { useEffect, useRef, useState } from 'react';
import { useGoogleIdentity } from './useGoogleIdentity';

interface GoogleSignInButtonRendererProps {
  onTokenReceived: (credentialResponse: google.accounts.id.CredentialResponse) => void;
  onError: (error: any) => void;
}

export const GoogleSignInButtonRenderer: React.FC<GoogleSignInButtonRendererProps> = ({ 
  onTokenReceived,
  onError 
}) => {
  const { renderGoogleButton } = useGoogleIdentity();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false); // Prevent multiple renders

  useEffect(() => {
    // Ensure we only attempt to render once and the ref is available
    if (!isRendered && buttonContainerRef.current) {
      const currentRef = buttonContainerRef.current;
      
      // Introduce a small delay
      const timerId = setTimeout(() => {
        renderGoogleButton(currentRef, onTokenReceived, onError)
          .then(() => {
            setIsRendered(true); // Mark as rendered
          })
          .catch(err => {
            // Propagate error upwards via the onError callback
            onError(err?.message || 'Failed to initiate Google Button rendering.');
          });
      }, 10); // Small delay (10ms)

      // Return a cleanup function to clear the timeout if the component unmounts quickly
      return () => clearTimeout(timerId);
    }

    // Cleanup function (optional but good practice)
    return () => {
      if (buttonContainerRef.current) {
        // It might be safer *not* to cleanup aggressively here, 
        // as React might try to remove the container itself later.
        // Let's comment this out for now unless needed.
        // while (buttonContainerRef.current.firstChild) {
        //   buttonContainerRef.current.removeChild(buttonContainerRef.current.firstChild);
        // }
      }
    };
    // Depend only on stable callbacks - this effect should run once per mount
  }, [renderGoogleButton, onTokenReceived, onError, isRendered]);

  return (
    <div 
      ref={buttonContainerRef} 
      className="flex justify-center items-center mb-2 min-h-[40px]"
    >
      {/* The Google button will be injected here by the script */} 
    </div>
  );
};
