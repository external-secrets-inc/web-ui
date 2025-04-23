import useSignIn from "react-auth-kit/hooks/useSignIn";

export interface LoginResponse {
  token: string,
  tenantId: string,
  tenant: string,
  userId: string,
}

export interface LoginPayload {
  email: string,
  password: string,
  tenant: string
}

export interface SignupPayload {
  email: string,
  name: string,
  password: string,
  tenant: string
}

export interface LoginAndIdentifyParams {
  email: string;
  password: string;
  tenantSlug: string;
  name?: string;
  authKitSignIn: ReturnType<typeof useSignIn>;
}
