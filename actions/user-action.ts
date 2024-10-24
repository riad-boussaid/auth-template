"use server";

import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/dashboard");

    return { success: "User role updated successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};


export const deleteAvatarAction = async () => {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(usersTable)
      .set({ avatar: null })
      .where(eq(usersTable.id, user.id));

    revalidatePath("/settings");

    return { success: "User avatar deleted successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};

export const updateAvatarAction = async (avatar: string) => {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const result = await cloudinary.uploader.upload(avatar, {
      use_filename: true,
    });

    console.log(result);

    // await cloudinary.api.resources.([billboardPublicId], {
    //   resource_type: "image",
    // });

    await db
      .update(usersTable)
      .set({ avatar: result.secure_url })
      .where(eq(usersTable.id, user.id));

    revalidatePath("/settings");

    return { success: "User avatar updated successfully" };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};
