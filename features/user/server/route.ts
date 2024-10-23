import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import * as argon2 from "@node-rs/argon2";
import { ResetPasswordSchema } from "../validators";

const app = new Hono()
  .post("/delete", async (c) => {
    try {
      const { user } = await getCurrentSession();

      if (!user) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      await db.delete(usersTable).where(eq(usersTable.id, user.id));

      return c.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      return c.json({ success: false, message: getErrorMessages(error) });
    }
  })
  .post(
    "/updateUsername",
    zValidator("json", z.object({ username: z.string() })),
    async (c) => {
      try {
        const { user } = await getCurrentSession();

        if (!user) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }

        const { username } = c.req.valid("json");

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
    zValidator("json", ResetPasswordSchema),
    async (c) => {
      try {
        const { user } = await getCurrentSession();
        if (!user) {
          throw new HTTPException(401, { message: "Unauthorized" });
        }

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

        const { password, newPassword } = c.req.valid("json");

        const isValidPassword = await argon2.verify(
          existingUser.hashedPassword,
          password,
        );

        if (!isValidPassword) {
          throw new HTTPException(400, { message: "Incorrect password" });
        }

        const hashedNewPassword = await argon2.hash(newPassword);

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
  );

export default app;
