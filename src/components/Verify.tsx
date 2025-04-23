import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { IUserData } from "@/types";
import { useEffect, useMemo, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { secondsToMMSS } from "@/utils/datetimeFormating";
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader'
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LucideLoader } from "lucide-react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { trackSignedOut } from "@/analytics";
import { Button } from "@/components/ui/button";
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { getUserData } from "@/services/users/queries/useGetUserData";
import useSendVerificationCode from "@/services/email/mutations/useSendVerificationCode";
import useValidateVerificationCode from "@/services/email/mutations/useValidateVerificationCode";

export function Verify() {
  const authUser = useAuthUser<IUserData>();
  const authHeader = useAuthHeader();
  const authKitSignIn = useSignIn();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const [resendCountdown, setResendCountdown] = useState<number>(ONE_MINUTE_IN_SECONDS);
  const [code, setCode] = useState<string>("")

  const { mutate: sendVerificationCode } = useSendVerificationCode({
    onSuccess: () => {
      const requestedAt = new Date()
      localStorage.setItem("lastCodeRequestedAt", requestedAt.toISOString())
      setResendCountdown(ONE_MINUTE_IN_SECONDS)
    },
  })
  const { mutate: validateVerificationCode, isPending: isLoading } = useValidateVerificationCode({
    onSuccess: async () => {
      if (!authHeader || !authUser) return

      const [tokenType, token] = authHeader.split(" ")
      const userData = await getUserData(authUser.userId)

      // TODO: Create a UserProvider to share user data across the application and eliminate duplicated code in LoginForm, SignUpForm and Verify components
      // https://github.com/external-secrets-inc/web-ui/issues/60
      const isSignedIn = authKitSignIn({
        auth: {
          token,
          type: tokenType,
        },
        userState: {
          email: userData.email,
          organizationURL: authUser.organizationURL,
          name: userData.name,
          isActive: userData.is_active,
          tenantId: authUser.tenantId,
          tenant: authUser.tenant,
          userId: authUser.userId,
        },
      });
      if (isSignedIn) {
        localStorage.removeItem("lastCodeRequestedAt")
        toast.success("Welcome aboard! Your account is now active.")
        navigate("/")
      }
    },
    onError: () => {
      toast.error("Invalid verification code")
      setCode("")
    }
  })

  const handleSignOut = () => {
    signOut();
    trackSignedOut(true);
    navigate('/login');
  };

  const calculateCountDown = (lastCodeRequestedAt: Date) => {
    const now = new Date();

    const diffInSeconds = Math.ceil((now.getTime() - lastCodeRequestedAt.getTime()) / ONE_SECOND_IN_MILLISECONDS);
    const countDownStart = diffInSeconds > ONE_MINUTE_IN_SECONDS ? 0 : (ONE_MINUTE_IN_SECONDS - diffInSeconds)
    return countDownStart
  }

  const handleSubmit = async (code: string) => {
    if (!authUser || !authHeader) return;
    validateVerificationCode({email: authUser.email, tenant: authUser.tenant, code})
  }

  const handleResend = () => {
    if (!authUser) return;

    sendVerificationCode({email:authUser.email, tenant: authUser.tenant})
  }

  const handleChangeCode = (input: string) => setCode(input)

  useMemo(() => {
    if (!authUser) return

    const lastCodeRequestedAtString = localStorage.getItem("lastCodeRequestedAt")

    if (!lastCodeRequestedAtString) {
      sendVerificationCode({email:authUser.email, tenant: authUser.tenant})
      return
    }

    const lastCodeRequestedAt = new Date(lastCodeRequestedAtString);
    setResendCountdown(calculateCountDown(lastCodeRequestedAt))

  }, [authUser, sendVerificationCode])

  useEffect(() => {
    if (resendCountdown === 0) return;

    const interval = setInterval(() => {
      setResendCountdown(resendCountdown - 1)
    }, ONE_SECOND_IN_MILLISECONDS)

    return () => clearInterval(interval)
  }, [resendCountdown])

  if (authUser && authUser.isActive) return <Navigate to={"/"} replace={true} />

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <div className="max-w-md mx-auto text-center px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
              <h1 className="text-2xl font-bold mb-1">Welcome, {authUser!.name}. <br/> You're almost there!</h1>
              <p className="text-[15px] text-slate-500">Please input the 6-digit code sent to your email to finalize your account setup.</p>
          </header>
          <form id="otp-form">
              <div className="w-full inline-flex justify-center">
                <InputOTP maxLength={6} onComplete={handleSubmit} value={code} onChange={handleChangeCode} className="">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  {!isLoading && <InputOTPSeparator />}
                  {isLoading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
          </form>
          <div className="mt-4"><p className="text-sm text-muted-foreground/50">Didn't get the code?</p></div>
          <div className="mt-1">
            {resendCountdown > 0 && (
              <p className="text-sm text-slate-500">You can get a new one in <span className="font-medium text-primary">{secondsToMMSS(resendCountdown)}</span></p>
            )}
            {resendCountdown === 0 && (
              <Button variant="link" onClick={handleResend} className="text-sm font-medium text-primary cursor-pointer">Resend</Button>
            )}
          </div>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground/50">Not you?</p>
            <Button variant="link" onClick={handleSignOut} className="text-sm font-medium text-primary cursor-pointer">Sign in with a different account</Button>
          </div>
      </div>
    </div>
  );
}