import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { AuthCommonSection } from "@/components/Auth/common/AuthCommonSection";
import { APP_DOMAIN_STRIPPED } from "@/constants";
import { useAuthVerifyFlow } from "@/components/Auth";

export function AuthVerify() {
  const {
    authUser,
    code,
    error,
    isLoading,
    resendCountdown,
    otpInputRef,
    secondsToMMSS,
    handleChangeCode,
    handleSubmitCode,
    handleResend,
    handleSignOut,
  } = useAuthVerifyFlow();

  if (!authUser) return null;

  const orgSlug = authUser.organizationURL || authUser.tenant;

  const description = (
    <div className="grid gap-1 text-sm text-muted-foreground min-w-0">
      {orgSlug && (
        <p>
          You're logging in to{" "}
          <strong className="text-foreground [overflow-wrap:anywhere]">
            {APP_DOMAIN_STRIPPED}/{orgSlug}
          </strong>
        </p>
      )}
      <p>
        Enter the 6-digit code sent to{" "}
        <strong className="text-foreground [overflow-wrap:anywhere]">
          {authUser.email}
        </strong>
      </p>
    </div>
  );

  return (
    <AuthCommonSection
      title="Verify Your Account"
      description={description}
      ariaLabel="Verify Account"
    >
      <div className="grid gap-1">
        <InputOTP
          ref={otpInputRef}
          maxLength={6}
          value={code}
          onChange={handleChangeCode}
          onComplete={() => handleSubmitCode(code)}
        >
          <InputOTPGroup className="w-full">
            <InputOTPSlot className="flex-1 w-auto" index={0} />
            <InputOTPSlot className="flex-1 w-auto" index={1} />
            <InputOTPSlot className="flex-1 w-auto" index={2} />
            <InputOTPSlot className="flex-1 w-auto" index={3} />
            <InputOTPSlot className="flex-1 w-auto" index={4} />
            <InputOTPSlot className="flex-1 w-auto" index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          onClick={() => handleSubmitCode(code)}
          disabled={isLoading || code.length !== 6}
          className="w-full mt-1"
        >
          {isLoading ? <Loader /> : "Verify Code"}
        </Button>

        {error && (
          <p className="text-sm text-destructive mt-2">{error.message}</p>
        )}

        <p className="text-sm text-muted-foreground inline w-full mt-6">
          Didn't receive the code?{" "}
          {resendCountdown > 0 && (
            <>
              Send a new one in{" "}
              <span className="font-bold text-foreground font-mono leading-none">
                {secondsToMMSS(resendCountdown)}
              </span>
            </>
          )}
          {resendCountdown === 0 && (
            <Button
              variant="link"
              size="inline"
              onClick={handleResend}
              disabled={isLoading}
            >
              Resend
            </Button>
          )}
        </p>

        <p className="text-sm text-muted-foreground">
          Not your Organization or wrong email?{" "}
          <Button
            variant="link"
            size="inline"
            onClick={handleSignOut}
            disabled={isLoading}
            className="text-foreground underline"
          >
            Sign out
          </Button>
        </p>
      </div>
    </AuthCommonSection>
  );
}
