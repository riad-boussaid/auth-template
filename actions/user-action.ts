"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";

import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { roleEnums, usersTable } from "@/lib/db/schema";
import { passwordSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { getErrorMessages } from "@/lib/error-message";

export const updateUsernameAction = async (username: string) => {
  const { user } = await getCurrentSession();

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
  values: z.infer<typeof passwordSchema>,
) => {
  const { user } = await getCurrentSession();

  if (!user || !user.email) {
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
    values.password,
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

export const updateRoleAction = async (
  userId: string | undefined,
  // role: (typeof roleEnums.enumValues)[number],
  role: string,
) => {
  try {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    if (!userId) {
      throw new Error("Invalid");
    }

    if (user.id === userId) {
      throw new Error("You can't change role for current user");
    }

    await db
      .update(usersTable)
      .set({ role: role as (typeof roleEnums.enumValues)[number] })
      .where(eq(usersTable.id, userId));

    revalidatePath("/dashboard");

    return { success: "User role updated successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};

export const deleteAccountAction = async (userId: string | undefined) => {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!userId) {
      throw new Error("Invalid");
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));

    revalidatePath("/dashboard");

    return { success: "User deleted successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};
