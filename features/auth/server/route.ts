import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import jwt from "jsonwebtoken";

import { db } from "@/lib/db";
import { emailVerificationTable, usersTable } from "@/lib/db/schema";
import {
  ForgotPasswordSchema,
  ResetPasswordAuthSchema,
  SignInSchema,
  SignUpSchema,
} from "@/features/auth/validators";
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
  setSessionTokenCookie,
} from "@/lib/auth/session";
// import { generateRandomString } from "@oslojs/crypto/random";
// import { sendEmail } from "@/lib/email";
import { getErrorMessages } from "@/lib/error-message";

const app = new Hono()
  .get("/current", (c) => {
    // const user = c.get("user");

    return c.json({ data: "user" });
  })
  .post("/register", zValidator("json", SignUpSchema), async (c) => {
    try {
      const { username, email, password } = c.req.valid("json");

      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });

      if (existingUser) {
        throw new Error("User Already exist");
      }

      const hashedPassword = await argon2.hash(password);

      // try {
      const [{ userId }] = await db
        .insert(usersTable)
        .values({
          // id: userId,
          username,
          email,
          hashedPassword,
        })
        .returning({ userId: usersTable.id });

      // generate a random string 6 characters long
      const code = Math.random().toString(36).substring(2, 8);

      await db.insert(emailVerificationTable).values({
        userId,
        code,
        sentAt: new Date(),
      });

      const token = jwt.sign({ email, userId, code }, process.env.JWT_SECRET!, {
        expiresIn: "5m",
      });

      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;

      // send an email at this step.

      console.log(url);

      // await sendEmail({
      //   html: `<a href="${url}">Verify your email</a>`,
      //   subject: "Verify your email",
      //   to: email,
      // });

      return c.json({
        success: true,
        message:
          "We've sent an verification email to your inbox. Please verify your email to continue.",
        data: {
          userId,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  })
  .post("/login", zValidator("json", SignInSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      if (!existingUser.hashedPassword) {
        throw new Error("User not found");
      }

      const isValidPassword = await argon2.verify(
        existingUser.hashedPassword,
        password,
      );

      if (!isValidPassword) {
        throw new Error("Incorrect username or password");
      }

      if (existingUser.emailVerified === false) {
        return c.json({
          success: false,
          message: "email_not_verified",
        });
      }

      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);
      setSessionTokenCookie(sessionToken, session.expiresAt);

      return c.json({ success: true, message: "Logged in successfully" });
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  })
  .post("/logout", async (c) => {
    try {
      const { session } = await getCurrentSession();

      if (!session) {
        throw new Error("Unauthorized");
      }

      await invalidateSession(session.id);

      deleteSessionTokenCookie();

      return c.json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  })
  .post(
    "/forgot-password",
    zValidator("json", ForgotPasswordSchema),
    async (c) => {
      try {
        const { email } = c.req.valid("json");

        if (!email) throw new Error("Email not found");

        const existingUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, email),
        });

        if (!existingUser) {
          throw new Error("User not found");
        }

        return c.json({ success: true, message: existingUser.email });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  )
  .post(
    "/reset-password",
    zValidator("json", ResetPasswordAuthSchema),
    async (c) => {
      try {
        const { email, newPassword, confirmNewPassword } = c.req.valid("json");

        if (!email) {
          throw new Error("Email not found");
        }

        const hashedPassword = await argon2.hash(newPassword);

        await db
          .update(usersTable)
          .set({
            hashedPassword,
          })
          .where(eq(usersTable.email, email));

        return c.json({
          success: true,
          message: "Password Reseted Successfully",
        });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  );

export default app;
