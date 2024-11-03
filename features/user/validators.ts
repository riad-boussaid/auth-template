import { z } from "zod";

export const accountIdSchema = z.object({
  accountId: z.string().min(1),
});

export const sessionIdSchema = z.object({ sessionId: z.string().min(1) });

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1),
});

export const avatarSchema = z.object({
  avatar: z.string().min(1).url(),
});

export const updateUsernameSchema = z.object({ username: z.string() });

export const updateEmailSchema = z.object({
  email: z.string().email().max(255),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(1).max(256),
    newPassword: z.string().min(8).max(256),
    confirmNewPassword: z.string().max(256),
    // logoutFromOtherDevices: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.password, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
