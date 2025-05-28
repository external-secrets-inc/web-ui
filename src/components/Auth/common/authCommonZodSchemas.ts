import { z } from "zod";

// Export each schema individually to avoid temporal dead zone issues
export const passwordMinLengthValue = 12;
export const regexIsUppercase = /(?=.*[A-Z])/;
export const regexIsNumber = /(?=.*[0-9])/;
export const regexIsSpecialCharacter = /(?=.*[_!@#$%^&*()-])/;
export const regexAllowedPasswordCharacters = /[a-zA-Z0-9_!@#$%^&*()-]/;

export const regexPasswordPattern = new RegExp(
  `^${regexIsUppercase.source}${regexIsNumber.source}${regexIsSpecialCharacter.source}${regexAllowedPasswordCharacters.source}{${passwordMinLengthValue},}$`
);

// Export individual schemas directly to avoid initialization issues
export const organizationNameSchema = z
  .string()
  .min(1, "Cannot be empty");

export const nameSchema = z
  .string()
  .min(1, "Cannot be empty");

export const organizationURLSchema = z
  .string()
  .min(1, "Cannot be empty.")
  .regex(/^[a-z0-9-]+$/, "Organization URL may only contain lowercase letters, numbers, and dashes.");

export const emailSchema = z
  .string()
  .email("Invalid email address.");

export const newPasswordSchema = z
  .string()
  .min(passwordMinLengthValue, `Password must be at least ${passwordMinLengthValue} characters.`)
  .regex(regexIsUppercase, "Password must contain at least one uppercase letter.")
  .regex(regexIsNumber, "Password must contain at least one number.")
  .regex(regexIsSpecialCharacter, "Password must contain at least one special character (_!@#$%^&*()-).");

export const existingPasswordSchema = z
  .string()
  .min(1, "Cannot be empty.");

// Export the object containing all schemas for backward compatibility
// This references the individually exported schemas to avoid duplication
export const authCommonZodSchemas = {
  organizationName: organizationNameSchema,
  name: nameSchema,
  organizationURL: organizationURLSchema,
  email: emailSchema,
  newPassword: newPasswordSchema,
  existingPassword: existingPasswordSchema,
};
