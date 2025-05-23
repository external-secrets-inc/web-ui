import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

interface AuthLoginGoogleButtonProps {
  /**
   * Callback function invoked when Google Sign-In is successful.
   * It receives the credential response from Google.
   * @param credentialResponse The response from Google containing the ID token.
   */
  onTokenReceived: (credentialResponse: CredentialResponse) => void;

  /**
   * The loading state of the Google Sign-In button.
   */
  loading?: boolean;
}

export function AuthLoginGoogleButton({
  onTokenReceived,
  loading,
}: AuthLoginGoogleButtonProps) {
  return (
    // Markup and style-wise, this is a SUPER CHEEKY hack to render a custom
    // Google Sign-In button, lol. The actual Google Sign-In button
    // (`<GoogleLogin />`) is rendered transparent above our purely visual
    // custom button. Some CSS wizardry is used to add hover and focus styles to
    // the custom button based on parent style states.
    <div className="grid items-center group">
      <div className="[grid-area:1/-1] opacity-[0.005]"> {/* Some browsers hide an element from screen readers when opacity is 0, so we need to keep it barely visible */}
        <GoogleLogin
          aria-disabled={loading}
          onSuccess={onTokenReceived}
          onError={() => {
            console.error(
              "Google Sign-In Library Error: An error occurred during the Google Sign-In process."
            );
          }}
        />
      </div>
      <Button
        variant="secondary"
        className="[grid-area:1/-1] pointer-events-none group-has-[:focus-visible]:ring-1 group-has-[:focus-visible]:ring-primary group-hover:bg-secondary/80"
        tabIndex={-1}
        aria-hidden="true"
        disabled={loading}
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 262"
              className="dark:grayscale"
            >
              <path
                fill="#4285F4"
                d="M255.88 133.45c0-10.73-.87-18.57-2.76-26.69H130.55v48.45h71.95c-1.45 12.04-9.29 30.17-26.7 42.35l-.24 1.63 38.76 30.02 2.68.27c24.66-22.78 38.88-56.28 38.88-96.03"
              />
              <path
                fill="#34A853"
                d="M130.55 261.1c35.25 0 64.84-11.6 86.45-31.62l-41.2-31.91c-11.02 7.68-25.81 13.05-45.25 13.05-34.52 0-63.82-22.77-74.27-54.25l-1.53.13-40.3 31.19-.52 1.46c21.46 42.65 65.56 71.95 116.62 71.95"
              />
              <path
                fill="#FBBC05"
                d="M56.28 156.37a80.37 80.37 0 0 1-4.35-25.82c0-9 1.6-17.7 4.2-25.82l-.07-1.73-40.8-31.69-1.34.64C5.08 89.65 0 109.52 0 130.55s5.08 40.9 13.93 58.6l42.35-32.78"
              />
              <path
                fill="#EB4335"
                d="M130.55 50.48c24.51 0 41.05 10.59 50.48 19.44l36.84-35.98C195.24 12.91 165.8 0 130.55 0 79.49 0 35.39 29.3 13.92 71.95l42.22 32.78c10.59-31.48 39.89-54.25 74.41-54.25"
              />
            </svg>
            Login with Google
          </>
        )}
      </Button>
    </div>
  );
}
