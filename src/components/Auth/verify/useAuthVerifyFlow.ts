import { IUserData } from "@/types";
import { useEffect, useRef, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { secondsToMMSS } from "@/utils/datetimeFormating";
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSignOut } from "@/hooks/useSignOut";
import { ONE_MINUTE_IN_SECONDS, ONE_SECOND_IN_MILLISECONDS } from "@/constants";
import { getUserData } from "@/services/users/queries/useGetUserData";
import useSendVerificationCode from "@/services/email/mutations/useSendVerificationCode";
import useValidateVerificationCode from "@/services/email/mutations/useValidateVerificationCode";
import { createVerificationError, VERIFY_USER_MESSAGES, VerificationError } from "./authVerifyErrorHandlers";

const getStorageKey = (email: string, tenant: string): string => {
  return `lastCodeRequestedAt_${email}_${tenant}`;
};

const cleanupVerificationStorage = (email?: string, tenant?: string) => {
  if (!email || !tenant) return;
  localStorage.removeItem(getStorageKey(email, tenant));
};

export function useAuthVerifyFlow() {
  const authUser = useAuthUser<IUserData>();
  const authHeader = useAuthHeader();
  const signIn = useSignIn();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const otpInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const fromSignup = location.state?.fromSignup;

  const [countdown, setCountdown] = useState(ONE_MINUTE_IN_SECONDS);
  const [code, setCode] = useState("");
  const [error, setError] = useState<VerificationError | null>(null);

  useEffect(
    function redirectIfUserAlreadyActive() {
      if (authUser?.isActive) return navigate("/");
    },
    [authUser, navigate]
  );

  const { mutate: sendCode, isPending: isSendingCode } = useSendVerificationCode({
    onSuccess: () => {
      if (!authUser?.email || !authUser?.tenant) return;

      const storageKey = getStorageKey(authUser.email, authUser.tenant);
      localStorage.setItem(storageKey, new Date().toISOString());
      setCountdown(ONE_MINUTE_IN_SECONDS);

      if (fromSignup) {
        toast.success('Organization created successfully', {
          description: 'A verification code has been sent to your email',
        });
      } else {
        toast.info("A verification code has been sent to your email.");
      }

      otpInputRef.current?.focus();
      setError(null);
    },
    onError: (error) => {
      const verificationError = createVerificationError(error);
      setError(verificationError);

      if (verificationError.type === 'expired') {
        cleanupVerificationStorage(authUser?.email, authUser?.tenant);
      }
    }
  });

  const { mutate: validateCode, isPending: isValidatingCode } = useValidateVerificationCode({
    onSuccess: async () => {
      if (!authHeader || !authUser?.email || !authUser?.tenant || !authUser?.userId) {
        setError({
          type: 'session',
          message: VERIFY_USER_MESSAGES.SESSION_EXPIRED,
        });
        return;
      }

      const [tokenType, token] = authHeader.split(" ");
      const userData = await getUserData(authUser.userId);
      const orgUrl = authUser.organizationURL || authUser.tenant;

      if (!orgUrl) {
        setError({
          type: 'session',
          message: VERIFY_USER_MESSAGES.SESSION_EXPIRED,
        });
        return;
      }

      const isSignedIn = signIn({
        auth: { token, type: tokenType },
        userState: {
          email: userData.email,
          organizationURL: orgUrl,
          name: userData.name,
          isActive: userData.is_active,
          tenantId: authUser.tenantId,
          tenant: authUser.tenant,
          userId: authUser.userId,
        },
      });

      if (isSignedIn) {
        cleanupVerificationStorage(authUser.email, authUser.tenant);
        toast.success("Welcome aboard! Your account is now active.");
        navigate("/");
      }
    },
    onError: (error) => {
      const verificationError = createVerificationError(error);
      setError(verificationError);
      setCode("");
      otpInputRef.current?.focus();

      // Clean up storage if the error is due to expiration or max attempts
      if (verificationError.type === 'expired' || verificationError.type === 'max_attempts') {
        cleanupVerificationStorage(authUser?.email, authUser?.tenant);
      }
    },
  });

  useEffect(
    function sendInitialVerificationCode() {
      if (!authUser?.email || !authUser?.tenant) return;

      const storageKey = getStorageKey(authUser.email, authUser.tenant);
      const lastRequestedAt = localStorage.getItem(storageKey);

      if (!lastRequestedAt) {
        sendCode({ email: authUser.email, tenant: authUser.tenant });
      } else {
        const lastRequestTime = new Date(lastRequestedAt).getTime();
        const diffInSeconds = Math.ceil(
          (Date.now() - lastRequestTime) / ONE_SECOND_IN_MILLISECONDS
        );

        if (diffInSeconds > ONE_MINUTE_IN_SECONDS * 5) {
          cleanupVerificationStorage(authUser.email, authUser.tenant);
          sendCode({ email: authUser.email, tenant: authUser.tenant });
        } else {
          setCountdown(Math.max(0, ONE_MINUTE_IN_SECONDS - diffInSeconds));
        }
      }
    },
    [authUser, sendCode]
  );

  useEffect(
    function updateResendCountdown() {
      if (countdown === 0) return;
      const interval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, ONE_SECOND_IN_MILLISECONDS);
      return () => clearInterval(interval);
    },
    [countdown]
  );

  useEffect(
    function focusOTPInputOnMount() {
      otpInputRef.current?.focus();
    },
    []
  );

  const handleSignOut = () => {
    signOut({ reason: 'manual' });
  };

  return {
    authUser,
    code,
    error,
    isLoading: isValidatingCode || isSendingCode,
    resendCountdown: countdown,
    otpInputRef,
    secondsToMMSS,
    handleChangeCode: (newCode: string) => {
      setCode(newCode);
      setError(null);
    },
    handleSubmitCode: (code: string) => {
      if (!authUser?.email || !authUser?.tenant || code.length !== 6) return;
      validateCode({ email: authUser.email, tenant: authUser.tenant, code });
    },
    handleResend: () => {
      if (isSendingCode || !authUser?.email || !authUser?.tenant) return;
      sendCode({ email: authUser.email, tenant: authUser.tenant });
    },
    handleSignOut,
  };
}