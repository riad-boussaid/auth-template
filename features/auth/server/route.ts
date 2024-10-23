import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import jwt from "hono/jwt";

import { db } from "@/lib/db";
import {
  emailVerificationsTable,
  passwordResetSessionsTable,
  sessionsTable,
  usersTable,
} from "@/lib/db/schema";
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
import {
  createPasswordResetSession,
  validatePasswordResetSessionRequest,
} from "@/lib/password-reset";
import { cookies } from "next/headers";
import { z } from "zod";

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

      await db.insert(emailVerificationsTable).values({
        userId,
        code,
        sentAt: new Date(),
      });

      const token = await jwt.sign(
        {
          email,
          userId,
          code,
          expiresIn: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
        },
        process.env.JWT_SECRET!,
        "HS256",
      );

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
        throw new HTTPException(401, { message: "Unauthorized" });
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
    "/forgotPassword",
    zValidator("json", ForgotPasswordSchema),
    async (c) => {
      try {
        const { email } = c.req.valid("json");

        if (!email) {
          throw new HTTPException(400, { message: "Email not found" });
        }

        const [existingUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (!existingUser || !existingUser.email) {
          throw new HTTPException(400, { message: "User not found" });
        }

        // invalidateUserPasswordResetSessions(user.id);
        await db
          .delete(passwordResetSessionsTable)
          .where(eq(passwordResetSessionsTable.userId, existingUser.id));

        const sessionToken = generateSessionToken();
        const session = await createPasswordResetSession(
          sessionToken,
          existingUser.id,
          existingUser.email,
        );

        // sendPasswordResetEmail(session.email, session.code);
        console.log(`To ${session.email}: Your reset code is ${session.code}`);

        // setPasswordResetSessionTokenCookie(sessionToken, session.expiresAt);
        cookies().set("password_reset_session", sessionToken, {
          expires: session.expiresAt,
          sameSite: "lax",
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
        });

        // return c.redirect("/password-reset/email-verification");
        return c.json({ success: true, message: existingUser.email });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  )
  .post(
    "/passwordResetEmailVerification",
    zValidator("form", z.object({ code: z.string().min(6) })),
    async (c) => {
      const { session } = await validatePasswordResetSessionRequest();

      if (session === null) {
        throw new HTTPException(400, { message: "Not authenticated" });
      }
      if (session.emailVerified) {
        throw new HTTPException(400, { message: "Forbidden" });
      }

      const { code } = c.req.valid("form");

      // setPasswordResetSessionAsEmailVerified(session.id);
      await db
        .update(passwordResetSessionsTable)
        .set({ emailVerified: true })
        .where(eq(passwordResetSessionsTable.id, session.id));

      return c.json({ success: true, message: code });
    },
  )
  .post(
    "/passwordReset",
    zValidator("json", ResetPasswordAuthSchema),
    async (c) => {
      try {
        const { session: passwordResetSession, user } =
          await validatePasswordResetSessionRequest();

        if (passwordResetSession === null) {
          throw new HTTPException(400, { message: "Not authenticated" });
        }
        if (!passwordResetSession.emailVerified) {
          throw new HTTPException(400, { message: "Forbidden" });
        }

        // invalidateUserPasswordResetSessions(passwordResetSession.userId);
        await db
          .delete(passwordResetSessionsTable)
          .where(
            eq(passwordResetSessionsTable.userId, passwordResetSession.userId),
          );

        // invalidateUserSessions(passwordResetSession.userId);
        await db
          .delete(sessionsTable)
          .where(eq(sessionsTable.userId, passwordResetSession.userId));

        // await updateUserPassword(passwordResetSession.userId, password);

        const { newPassword } = c.req.valid("json");

        const hashedNewPassword = await argon2.hash(newPassword);

        await db
          .update(usersTable)
          .set({
            hashedPassword: hashedNewPassword,
          })
          .where(eq(usersTable.id, passwordResetSession.userId));

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);

        // setSessionTokenCookie(sessionToken, session.expiresAt);
        cookies().set("session", sessionToken, {
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: session.expiresAt,
        });

        // deletePasswordResetSessionTokenCookie();
        cookies().set("session", "", {
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
        });

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
