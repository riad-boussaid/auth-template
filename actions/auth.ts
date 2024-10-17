"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { generateCodeVerifier, generateState } from "arctic";
import { hash, verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import { generateRandomString } from "@oslojs/crypto/random";

import { google, facebook } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";
import { db } from "@/lib/db";
import { emailVerificationTable, usersTable } from "@/lib/db/schema";
import { SignInSchema, SignUpSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
  setSessionTokenCookie,
} from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const authorizationURL = await google.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      }
    );

    cookies().set("state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    cookies().set("codeVerifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    return {
      success: true,
      data: authorizationURL.toString(),
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};

export const createFacebookAuthorizationURL = async () => {
  try {
    const state = generateState();

    const authorizationURL = await facebook.createAuthorizationURL(state, {
      scopes: ["email", "public_profile"],
    });

    return {
      success: true,
      data: authorizationURL.toString(),
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const existingUser = await db.query.usersTable.findFirst({
      where: (table) => eq(table.email, email),
    });

    if (!existingUser) {
      return {
        error: "User not found",
      };
    }

    if (existingUser.emailVerified === true) {
      return {
        error: "Email already verified",
      };
    }

    const existedCode = await db.query.emailVerificationTable.findFirst({
      where: eq(emailVerificationTable.userId, existingUser.id),
    });

    if (!existedCode) {
      return {
        error: "Code not found",
      };
    }

    const sentAt = new Date(existedCode.sentAt);
    const isOneMinuteHasPassed =
      new Date().getTime() - sentAt.getTime() > 60000; // 1 minute

    if (!isOneMinuteHasPassed) {
      return {
        error:
          "Email already sent next email in " +
          (60 - Math.floor((new Date().getTime() - sentAt.getTime()) / 1000)) +
          " seconds",
      };
    }

    const code = Math.random().toString(36).substring(2, 8);

    await db
      .update(emailVerificationTable)
      .set({
        code,
        sentAt: new Date(),
      })
      .where(eq(emailVerificationTable.userId, existingUser.id));

    const token = jwt.sign(
      { email, userId: existingUser.id, code },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;

    await sendEmail({
      html: `<a href="${url}">Verify your email</a>`,
      subject: "Verify your email",
      to: email,
    });
    console.log(url);

    return {
      success: "Email sent",
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const existingUser = await db.query.usersTable.findFirst({
    where: (table) => eq(table.email, values.email),
  });

  if (existingUser) {
    return {
      error: "User Already exist",
    };
  }

  console.log(values);

  const hashedPassword = await hash(values.password);
  const userId = generateRandomString(
    {
      read(bytes: Uint8Array): void {
        crypto.getRandomValues(bytes);
      },
    },
    "abcdefghijklmnopqrstuvwxyz0123456789",
    15
  );

  try {
    await db.insert(usersTable).values({
      id: userId,
      username: values.username,
      email: values.email,
      hashedPassword,
    });

    // generate a random string 6 characters long
    const code = Math.random().toString(36).substring(2, 8);

    await db.insert(emailVerificationTable).values({
      code,
      userId,
      id: userId,
      sentAt: new Date(),
    });

    const token = jwt.sign(
      { email: values.email, userId, code },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;

    // send an email at this step.

    console.log(url);

    await sendEmail({
      html: `<a href="${url}">Verify your email</a>`,
      subject: "Verify your email",
      to: values.email,
    });

    // const session = await lucia.createSession(userId, {
    //   expiresIn: 60 * 60 * 24 * 30,
    // })

    // const sessionCookie = lucia.createSessionCookie(session.id)

    // cookies().set(
    //   sessionCookie.name,
    //   sessionCookie.value,
    //   sessionCookie.attributes
    // )

    return {
      success: true,
      data: {
        userId,
      },
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
  try {
    SignInSchema.parse(values);
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }

  const existingUser = await db.query.usersTable.findFirst({
    where: (table) => eq(table.email, values.email),
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
    values.password
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
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, existingUser.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);

  return {
    success: "Logged in successfully",
  };
};

export const signOut = async () => {
  try {
    const { session } = await getCurrentSession();
    if (!session) {
      return {
        error: "Unauthorized",
      };
    }

    await invalidateSession(session.id);
    deleteSessionTokenCookie();
    return redirect("/");
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};
