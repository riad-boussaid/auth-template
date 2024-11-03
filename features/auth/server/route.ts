import { Hono } from "hono";
import { getConnInfo } from "hono/vercel";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";

import { db } from "@/lib/db";
import { sessionsTable, usersTable } from "@/lib/db/schema";
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
  SessionFlags,
  setSessionTokenCookie,
} from "@/lib/auth/session";
import { getErrorMessages } from "@/lib/error-message";
import {
  createPasswordResetSession,
  deletePasswordResetSessionTokenCookie,
  invalidateUserPasswordResetSessions,
  sendPasswordResetEmail,
  setPasswordResetSessionAsEmailVerified,
  setPasswordResetSessionTokenCookie,
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

import { sessionMiddleware } from "@/lib/session-middleware";
import { ErrorResponse, SuccessResponse } from "@/types";
import { generateRandomRecoveryCode } from "@/lib/utils";
import { encryptString } from "@/lib/encryption";

const app = new Hono()
  .get("/current", sessionMiddleware, (c) => {
    const user = c.get("user");
    const session = c.get("session");

    return c.json<SuccessResponse<{ userId: string }>>({
      success: true,
      message: "success",
      data: { userId: session.id },
    });
  })
  .post("/register", zValidator("form", SignUpSchema), async (c) => {
    try {
      const { username, email, password } = c.req.valid("form");

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (existingUser) {
        throw new HTTPException(400, { message: "User Already exist" });
      }

      const hashedPassword = await hash(password);

      const recoveryCode = generateRandomRecoveryCode();
      // const encryptedRecoveryCode = encryptString(recoveryCode);

      const [createdUser] = await db
        .insert(usersTable)
        .values({
          username,
          email,
          hashedPassword,
          // recoveryCode: encryptedRecoveryCode.toString(),
          recoveryCode,
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

      await setEmailVerificationRequestCookie(emailVerificationRequest);

      const info = getConnInfo(c); // info is `ConnInfo`
      const sessionFlags: SessionFlags = {
        twoFactorVerified: false,
      };

      const sessionToken = generateSessionToken();
      const session = await createSession(
        sessionToken,
        createdUser.userId,
        sessionFlags,
        (info.remote.address ?? "127.0.0.1").split(",")[0],
      );
      await setSessionTokenCookie(sessionToken, session.expiresAt);

      // await sendEmail({
      //   html: `<a href="${url}">Verify your email</a>`,
      //   subject: "Verify your email",
      //   to: email,
      // });

      return c.json<SuccessResponse<{ userId: string }>>(
        {
          success: true,
          message:
            "We've sent an verification email to your inbox. Please verify your email to continue.",
          data: {
            userId: createdUser.userId,
          },
        },
        200,
      );
    } catch (error) {
      return c.json<ErrorResponse>({
        success: false,
        error: getErrorMessages(error),
      });
    }
  })
  .post("/login", zValidator("form", SignInSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("form");

      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!existingUser || !existingUser.hashedPassword) {
        throw new HTTPException(404, { message: "User not found" });
      }

      const isValidPassword = await verify(
        existingUser.hashedPassword,
        password,
      );

      if (!isValidPassword) {
        throw new HTTPException(400, {
          message: "Incorrect username or password",
        });
      }

      const info = getConnInfo(c); // info is `ConnInfo`
      const sessionFlags: SessionFlags = {
        twoFactorVerified: false,
      };
      const sessionToken = generateSessionToken();
      const session = await createSession(
        sessionToken,
        existingUser.id,
        sessionFlags,
        (info.remote.address ?? "127.0.0.1").split(",")[0],
      );
      await setSessionTokenCookie(sessionToken, session.expiresAt);

      if (existingUser.emailVerified === false) {
        // return c.redirect("/email-verification");
        return c.json<ErrorResponse>({
          success: false,
          error: "email_not_verified",
        });
      }

      if (!existingUser.totpKey) {
        return c.json<ErrorResponse>({
          success: false,
          error: "2fa_not_registerd",
        });
      }

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Logged in successfully",
        },
        200,
      );
    } catch (error) {
      return c.json<ErrorResponse>({
        success: false,
        error: getErrorMessages(error),
      });
    }
  })
  .post("/logout", sessionMiddleware, async (c) => {
    try {
      const session = c.get("session");

      await invalidateSession(session.id);

      await deleteSessionTokenCookie();

      // const { NEXT_PUBLIC_APP_URL } = env<{ NEXT_PUBLIC_APP_URL: string }>(c);

      // return c.redirect(new URL("/", NEXT_PUBLIC_APP_URL).href, 302);

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Logout Successfully",
        },
        200,
      );
    } catch (error) {
      return c.json<ErrorResponse>({
        success: false,
        error: getErrorMessages(error),
      });
    }
  })
  .post(
    "/emailVerification",
    sessionMiddleware,
    zValidator("form", z.object({ code: z.string().min(6) })),
    async (c) => {
      try {
        const user = c.get("user");

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
        }

        if (verificationRequest.code !== code) {
          throw new HTTPException(400, { message: "Incorrect code." });
        }

        await deleteUserEmailVerificationRequest(user.id);

        await invalidateUserPasswordResetSessions(user.id);

        // updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
        await db
          .update(usersTable)
          .set({ email: verificationRequest.email, emailVerified: true })
          .where(eq(usersTable.id, user.id));

        await deleteEmailVerificationRequestCookie();

        return c.json<SuccessResponse>(
          {
            success: true,
            message: "Email verified successfully",
          },
          200,
        );
      } catch (error) {
        return c.json<ErrorResponse>({
          success: false,
          error: getErrorMessages(error),
        });
      }
    },
  )
  .post("/resendEmailVerification", sessionMiddleware, async (c) => {
    try {
      const user = c.get("user");

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

      await setEmailVerificationRequestCookie(verificationRequest);

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "A new code was sent to your inbox.",
        },
        200,
      );
    } catch (error) {
      return c.json<ErrorResponse>({
        success: false,
        error: getErrorMessages(error),
      });
    }
  })
  .post(
    "/forgotPassword",
    zValidator("form", ForgotPasswordSchema),
    async (c) => {
      try {
        const { email } = c.req.valid("form");

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

        await invalidateUserPasswordResetSessions(existingUser.id);

        const sessionToken = generateSessionToken();
        const session = await createPasswordResetSession(
          sessionToken,
          existingUser.id,
          existingUser.email,
        );

        sendPasswordResetEmail(session.email, session.code);

        await setPasswordResetSessionTokenCookie(
          sessionToken,
          session.expiresAt,
        );

        // return c.redirect("/password-reset/email-verification");
        return c.json<SuccessResponse<{ email: string }>>(
          {
            success: true,
            message: "Email sent successfully",
            data: { email: existingUser.email },
          },
          200,
        );
      } catch (error) {
        return c.json<ErrorResponse>({
          success: false,
          error: getErrorMessages(error),
        });
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

      if (code !== session.code) {
        throw new HTTPException(400, { message: "Incorrect code" });
      }

      await setPasswordResetSessionAsEmailVerified(session.id);

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

      return c.json<SuccessResponse<{ code: string }>>(
        {
          success: true,
          message: "code sent successfully",
          data: { code },
        },
        200,
      );
    },
  )
  .post(
    "/passwordReset",
    zValidator("form", ResetPasswordAuthSchema),
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

        await invalidateUserPasswordResetSessions(user.id);

        // invalidateUserSessions(user.id;
        await db.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));

        // await updateUserPassword(passwordResetSession.userId, password);

        const { confirmNewPassword } = c.req.valid("form");

        const hashedNewPassword = await hash(confirmNewPassword);

        await db
          .update(usersTable)
          .set({
            hashedPassword: hashedNewPassword,
          })
          .where(eq(usersTable.id, user.id));

        const info = getConnInfo(c);

        const sessionToken = generateSessionToken();
        const session = await createSession(
          sessionToken,
          user.id,
          (info.remote.address ?? "127.0.0.1").split(",")[0],
        );

        await setSessionTokenCookie(sessionToken, session.expiresAt);

        await deletePasswordResetSessionTokenCookie();

        return c.json<SuccessResponse>(
          {
            success: true,
            message: "Password Reset Successfully",
          },
          200,
        );
      } catch (error) {
        return c.json<ErrorResponse>({
          success: false,
          error: getErrorMessages(error),
        });
      }
    },
  );

export default app;
