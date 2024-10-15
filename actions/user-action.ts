"use server";

import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { passwordSchema } from "@/lib/validators";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateUsernameAction = async (username: string) => {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(usersTable)
    .set({ username })
    .where(eq(usersTable.id, user.id));

  return { success: "Successefully updated" };
};

export const updatePasswordAction = async (
  values: z.infer<typeof passwordSchema>
) => {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, user.email),
  });

  if (!existingUser) {
    return {
      error: "User not found",
    };
  }

  if (!existingUser.hashedPassword) {
    return {
      error: "User not found",
    };
  }

  const isValidPassword = await verify(
    existingUser.hashedPassword,
    values.password
  );

  if (!isValidPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  if (existingUser.emailVerified === false) {
    return {
      error: "Email not verified",
      key: "email_not_verified",
    };
  }

  const hashedNewPassword = await hash(values.newPassword);

  await db
    .update(usersTable)
    .set({ hashedPassword: hashedNewPassword })
    .where(eq(usersTable.id, user.id));

  return { success: "Successefully updated" };
};
