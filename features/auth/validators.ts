import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.email().max(255),
});

export const SignUpSchema = z
  .object({
    username: z.string().trim().min(1).max(255),
    email: z.email().max(255),
    password: z
      .string()
      .min(8, {
          error: "Password must be at least 8 characters long"
    })
      .max(256),
    confirmPassword: z
      .string()
      .min(8, {
          error: "Password must be at least 8 characters long"
    })
      .max(256),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
      error: "Passwords do not match"
});

export const SignInSchema = z.object({
  email: z.email().max(255),
  password: z
    .string()
    .min(1, {
        error: "Password must be at least % characters long"
    })
    .max(256),
});

export const ResetPasswordAuthSchema = z
  .object({
    // email: z.string().email().max(255),
    newPassword: z.string().min(8).max(256),
    confirmNewPassword: z.string().min(8).max(256),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
      error: "Passwords do not match"
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, {
        error: "Password must be at least 8 characters long"
    })
    .max(256),
  newPassword: z
    .string()
    .min(8, {
        error: "Password must be at least 8 characters long"
    })
    .max(256),
});

export const twoFactorSetupSchema = z.object({
  encodedKey: z.string(),
  code: z.string(),
});

export const twoFactorResetSchema = z.object({
  backupCode: z.string(),
});

export const twoFactorVerificationSchema = z.object({
  code: z.string(),
});
