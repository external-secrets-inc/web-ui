import { z } from "zod";

export default {
  organizationName: z
    .string()
    .min(1, "Cannot be empty"),
  name: z.string().min(1, "Cannot be empty"),
  organizationURL: z
    .string()
    .min(1, "Cannot be empty.")
    .regex(/^[a-zA-Z0-9-]+$/, "Organization URL may only contain letters, numbers, and dashes."),
  email: z.string().email("Invalid email address."),
  newPassword: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character."
    ),
  existingPassword: z.string().min(1, "Cannot be empty."),
}
