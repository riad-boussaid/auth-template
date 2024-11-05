import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const SignUpSchema = z
  .object({
    username: z.string().trim().min(1).max(255),
    email: z.string().email().max(255),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(256),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(256),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignInSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(1, { message: "Password must be at least % characters long" })
    .max(256),
});

export const ResetPasswordAuthSchema = z
  .object({
    // email: z.string().email().max(255),
    newPassword: z.string().min(8).max(256),
    confirmNewPassword: z.string().min(8).max(256),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, { message: "Password must be at least 8 characters long" })
    .max(256),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(256),
});

export const twoFactorSetupSchema = z.object({
  encodedKey: z.string(),
  code: z.string(),
});
export const twoFactorSchema = z.object({
  code: z.string(),
});
