import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { hash, verify } from "@node-rs/argon2";
// import jwt from "hono/jwt";

import { db } from "@/lib/db";
import {
  // emailVerificationsTable,
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
  deletePasswordResetSessionTokenCookie,
  validatePasswordResetSessionRequest,
} from "@/lib/auth/password-reset";

import {
  createEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  deleteUserEmailVerificationRequest,
  getUserEmailVerificationRequestFromRequest,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
} from "@/lib/auth/email-verification";

const app = new Hono()
  .get("/current", (c) => {
    // const user = c.get("user");

    return c.json({ data: "user" });
  })
  .post("/register", zValidator("json", SignUpSchema), async (c) => {
    try {
      const { username, email, password } = c.req.valid("json");

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (existingUser) {
        throw new Error("User Already exist");
      }

      const hashedPassword = await hash(password);

      const [createdUser] = await db
        .insert(usersTable)
        .values({
          // id: userId,
          username,
          email,
          hashedPassword,
        })
        .returning({ userId: usersTable.id, email: usersTable.email });

      if (!createdUser.userId || !createdUser.email) {
        throw new HTTPException(400, { message: "Something went wrong" });
      }

      const emailVerificationRequest = await createEmailVerificationRequest(
        createdUser.userId,
        createdUser.email,
      );

      sendVerificationEmail(
        emailVerificationRequest.email,
        emailVerificationRequest.code,
      );

      setEmailVerificationRequestCookie(emailVerificationRequest);

      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, createdUser.userId);
      setSessionTokenCookie(sessionToken, session.expiresAt);

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
          userId: createdUser.userId,
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

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!existingUser) {
        throw new Error("User not found");
      }

      if (!existingUser.hashedPassword) {
        throw new Error("User not found");
      }

      const isValidPassword = await verify(
        existingUser.hashedPassword,
        password,
      );

      if (!isValidPassword) {
        throw new Error("Incorrect username or password");
      }

      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);
      setSessionTokenCookie(sessionToken, session.expiresAt);

      if (existingUser.emailVerified === false) {
        // return c.redirect("/email-verification");
        return c.json({
          success: false,
          message: "email_not_verified",
        });
      }

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
    "/emailVerification",
    zValidator("form", z.object({ code: z.string().min(6) })),
    async (c) => {
      try {
        const { session: s, user } = await getCurrentSession();

        if (s === null) {
          throw new HTTPException(400, { message: "Not authenticated" });
        }

        let verificationRequest =
          await getUserEmailVerificationRequestFromRequest();

        if (verificationRequest === null) {
          throw new HTTPException(400, { message: "Not authenticated" });
        }

        const { code } = c.req.valid("form");

        if (Date.now() >= verificationRequest.expiresAt.getTime()) {
          verificationRequest = await createEmailVerificationRequest(
            verificationRequest.userId,
            verificationRequest.email,
          );

          sendVerificationEmail(
            verificationRequest.email,
            verificationRequest.code,
          );
          throw new HTTPException(400, {
            message:
              "The verification code was expired. We sent another code to your inbox.",
          });

          // return c.json({
          //   success: true,
          //   message:
          //     "The verification code was expired. We sent another code to your inbox.",
          // });
        }

        if (verificationRequest.code !== code) {
          throw new HTTPException(400, { message: "Incorrect code." });
        }

        deleteUserEmailVerificationRequest(user.id);
        // invalidateUserPasswordResetSessions(user.id);
        await db
          .delete(passwordResetSessionsTable)
          .where(eq(passwordResetSessionsTable.userId, user.id));

        // updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
        await db
          .update(usersTable)
          .set({ email: verificationRequest.email, emailVerified: true })
          .where(eq(usersTable.id, user.id));

        deleteEmailVerificationRequestCookie();

        return c.json({
          success: true,
          message: "Email verified successfully",
        });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  )
  .post("/resendEmailVerification", async (c) => {
    try {
      const { session, user } = await getCurrentSession();
      if (session === null) {
        throw new HTTPException(400, { message: "Not authenticated" });
      }

      let verificationRequest =
        await getUserEmailVerificationRequestFromRequest();

      if (user === null || user.email === null) {
        throw new HTTPException(400, { message: "No user or user email" });
      }

      if (verificationRequest === null) {
        if (user.emailVerified) {
          throw new HTTPException(400, { message: "Forbidden" });
        }

        verificationRequest = await createEmailVerificationRequest(
          user.id,
          user.email,
        );
      } else {
        verificationRequest = await createEmailVerificationRequest(
          user.id,
          verificationRequest.email,
        );
      }

      sendVerificationEmail(
        verificationRequest.email,
        verificationRequest.code,
      );

      setEmailVerificationRequestCookie(verificationRequest);

      return c.json({
        success: true,
        message: "A new code was sent to your inbox.",
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
        (await cookies()).set("password_reset_session", sessionToken, {
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

      console.log(session);

      if (session === null) {
        throw new HTTPException(400, { message: "Not authenticated" });
      }
      if (session.emailVerified) {
        throw new HTTPException(400, { message: "Forbidden" });
      }

      const { code } = c.req.valid("form");

      if (code !== session.code) {
        throw new HTTPException(400, { message: "Incorrect code" });
      }

      // setPasswordResetSessionAsEmailVerified(session.id);
      await db
        .update(passwordResetSessionsTable)
        .set({ emailVerified: true })
        .where(eq(passwordResetSessionsTable.id, session.id));

      // setUserAsEmailVerifiedIfEmailMatches(userId: number, email: string)
      const [result] = await db
        .update(usersTable)
        .set({ emailVerified: true })
        .where(
          and(
            // eq(usersTable.id, session.userId),
            eq(usersTable.email, session.email),
          ),
        )
        .returning();

      if (!result) {
        throw new HTTPException(400, { message: "Please restart the process" });
      }

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

        const hashedNewPassword = await hash(newPassword);

        await db
          .update(usersTable)
          .set({
            hashedPassword: hashedNewPassword,
          })
          .where(eq(usersTable.id, passwordResetSession.userId));

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, user.id);

        // setSessionTokenCookie(sessionToken, session.expiresAt);
        (await cookies()).set("session", sessionToken, {
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: session.expiresAt,
        });

        deletePasswordResetSessionTokenCookie();
        // cookies().set("password_reset_session", "", {
        //   httpOnly: true,
        //   path: "/",
        //   secure: process.env.NODE_ENV === "production",
        //   sameSite: "lax",
        //   maxAge: 0,
        // });

        return c.json({
          success: true,
          message: "Password Reset Successfully",
        });
      } catch (error) {
        return c.json({ success: false, message: getErrorMessages(error) });
      }
    },
  );

export default app;
