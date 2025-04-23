export interface SendVerificationCodePayload {
  email: string,
  tenant: string,
}

export interface ValidateVerificationCodePayload {
  email: string,
  tenant: string,
  code: string,
}
