import { z } from "zod";

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(8),
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
