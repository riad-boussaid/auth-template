import { z } from "zod";

export const SignUpSchema = z
  .object({
    username: z.string().trim().min(1),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password must be at least % characters long" }),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    newPassword: z.string().min(8),
    logoutFromOtherDevices: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.password, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  })

  export const passwordSchema = z.object({
    password: z
      .string()
      .min(1, { message: "Password must be at least 8 characters long" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  });