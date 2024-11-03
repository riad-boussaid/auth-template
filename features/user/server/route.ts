import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verify, hash } from "@node-rs/argon2";
import { v2 as cloudinary } from "cloudinary";

import { db } from "@/lib/db";
import {
  accountsTable,
  roleEnums,
  sessionsTable,
  usersTable,
} from "@/lib/db/schema";
import { getCurrentSession } from "@/lib/auth/session";
import { getErrorMessages } from "@/lib/error-message";

import { ResetPasswordSchema } from "@/features/user/validators";
import { sessionMiddleware } from "@/lib/session-middleware";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = new Hono()
  .post("/deleteUser", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");

      await db.delete(usersTable).where(eq(usersTable.id, user.id));

      return c.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      return c.json({ success: false, message: getErrorMessages(error) });
    }
  })
  .post(
    "/updateUsername",
    zValidator("form", z.object({ username: z.string() })),
    sessionMiddleware,
    async (c) => {
      try {
        const user = c.get("user");

        const { username } = c.req.valid("form");

        const [currentUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, user.id))
          .limit(1);

        if (currentUser?.username === username) {
          throw new HTTPException(400, { message: "Username is the same" });
        }

        await db
          .update(usersTable)
          .set({ username })
          .where(eq(usersTable.id, user.id));

        return c.json({
          success: true,
          message: "Username updated successfully",
        });
      } catch (error) {
        return c.json({
          success: false,
          message: getErrorMessages(error),
        });
      }
    },
  )
  .post(
    "/updatePassword",
    zValidator("form", ResetPasswordSchema),
    sessionMiddleware,
    async (c) => {
      try {
        const user = c.get("user");

        const [existingUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, user.id))
          .limit(1);

        if (!existingUser.hashedPassword) {
          throw new HTTPException(400, {
            message: "User do not have password",
          });
        }

        const { password, newPassword } = c.req.valid("form");

        const isValidPassword = await verify(
          existingUser.hashedPassword,
          password,
        );

        if (!isValidPassword) {
          throw new HTTPException(400, { message: "Incorrect password" });
        }

        const hashedNewPassword = await hash(newPassword);

        await db
          .update(usersTable)
          .set({ hashedPassword: hashedNewPassword })
          .where(eq(usersTable.id, user.id));

        return c.json({
          success: true,
          message: "Password updated successfully",
        });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  )
  .post(
    "/updateAvatar",
    sessionMiddleware,
    zValidator(
      "form",
      z.object({
        avatar: z.string().min(1).url(),
      }),
    ),
    async (c) => {
      try {
        const user = c.get("user");

        const { avatar } = c.req.valid("form");

        const result = await cloudinary.uploader.upload(avatar, {
          use_filename: true,
        });

        await db
          .update(usersTable)
          .set({ avatar: result.secure_url })
          .where(eq(usersTable.id, user.id));

        return c.json({
          success: true,
          message: "User avatar updated successfully",
        });
      } catch (error) {
        return c.json({
          success: false,
          message: getErrorMessages(error),
        });
      }
    },
  )
  .post("/deleteAvatar", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");

      await db
        .update(usersTable)
        .set({ avatar: null })
        .where(eq(usersTable.id, user.id));

      return c.json({
        success: true,
        message: "User avatar removed successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  })
  .post(
    "/updateRole",
    zValidator(
      "form",
      z.object({
        userId: z.string().min(1),
        role: z.string().min(1),
      }),
    ),
    async (c) => {
      try {
        const { user } = await getCurrentSession();

        if (!user || user.role !== "ADMIN") {
          throw new HTTPException(400, { message: "Unauthorized" });
        }

        const { userId, role } = c.req.valid("form");

        if (!userId) {
          throw new HTTPException(400, { message: "Invalid" });
        }

        if (user.id === userId) {
          throw new HTTPException(400, {
            message: "You can't change role for current user",
          });
        }

        await db
          .update(usersTable)
          .set({ role: role as (typeof roleEnums.enumValues)[number] })
          .where(eq(usersTable.id, userId));

        return c.json({
          success: true,
          message: "User role updated successfully",
        });
      } catch (error) {
        return c.json({
          success: false,
          message: getErrorMessages(error),
        });
      }
    },
  )
  .post(
    "/deleteSession",
    sessionMiddleware,
    zValidator("form", z.object({ sessionId: z.string().min(1) })),
    async (c) => {
      const { sessionId } = c.req.valid("form");

      await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

      return c.json({
        success: true,
        message: "Session deleted successfully",
      });
    },
  )
  .post(
    "/deleteAccount",
    zValidator(
      "form",
      z.object({
        accountId: z.string().min(1),
      }),
    ),

    async (c) => {
      try {
        const { accountId } = c.req.valid("form");

        if (!accountId) {
          throw new HTTPException(400, { message: "invalid account id" });
        }

        await db.delete(accountsTable).where(eq(accountsTable.id, accountId));

        return c.json({
          success: true,
          message: `Account deleted successfully `,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: getErrorMessages(error),
        });
      }
    },
  );

export default app;
