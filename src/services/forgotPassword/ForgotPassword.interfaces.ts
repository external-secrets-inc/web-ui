export interface ForgotPasswordPayload {
  email: string,
  tenant: string,
}

export interface ResetPasswordPayload {
  email: string,
  tenant: string,
  password: string,
  token: string,
}
