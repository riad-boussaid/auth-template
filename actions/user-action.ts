"use server";

import "server-only";

import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { roleEnums, usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    return { success: "User role updated successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};
