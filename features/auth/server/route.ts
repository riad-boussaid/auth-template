import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { SignInSchema } from "@/lib/validators";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";

const app = new Hono().post(
  "/login",
  zValidator("json", SignInSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!existingUser) {
      return c.json({
        error: "User not found",
      });
    }

    if (!existingUser.hashedPassword) {
      return c.json({
        error: "User not found",
      });
    }

    const isValidPassword = await verify(existingUser.hashedPassword, password);

    if (!isValidPassword) {
      return c.json({
        error: "Incorrect username or password",
      });
    }

    if (existingUser.emailVerified === false) {
      return c.json({
        error: "Email not verified",
        key: "email_not_verified",
      });
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    return c.json({ success: "Logged in successfully" });
  },
);

export default app;
