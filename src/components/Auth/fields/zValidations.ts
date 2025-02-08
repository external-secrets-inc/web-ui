import { z } from "zod";

export const passwordMinLengthValue = 12;
export const regexIsUppercase = /(?=.*[A-Z])/;
export const regexIsNumber = /(?=.*[0-9])/;
export const regexIsSpecialCharacter = /(?=.*[_!@#$%^&*()-])/;
export const regexAllowedPasswordCharacters = /^[a-zA-Z0-9_!@#$%^&*()-]+$/;

const zValidations = {
  organizationName: z
    .string()
    .min(1, "Cannot be empty"),
  name: z.string().min(1, "Cannot be empty"),
  organizationURL: z
    .string()
    .min(1, "Cannot be empty.")
    .regex(/^[a-z0-9-]+$/, "Organization URL may only contain lowercase letters, numbers, and dashes."),
  email: z.string().email("Invalid email address."),
  newPassword: z
    .string()
    .min(passwordMinLengthValue, `Password must be at least ${passwordMinLengthValue} characters.`)
    .regex(regexIsUppercase, "Password must contain at least one uppercase letter.")
    .regex(regexIsNumber, "Password must contain at least one number.")
    .regex(regexIsSpecialCharacter, "Password must contain at least one special character (_!@#$%^&*()-)")
    .regex(regexAllowedPasswordCharacters, "Password contains invalid characters. Use only letters, numbers, and these special characters: _!@#$%^&*()-"),
  existingPassword: z.string().min(1, "Cannot be empty."),
}

export default zValidations;