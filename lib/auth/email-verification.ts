import { encodeBase32 } from "@oslojs/encoding";
import { and, eq } from "drizzle-orm";
import { Context } from "hono";
import {  setCookie } from "hono/cookie";

import { db } from "@/lib/db";
import { EmailVerification, emailVerificationsTable } from "@/lib/db/schema";

import { generateRandomOTP } from "@/lib/auth/password-reset";
import { getCurrentSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function getUserEmailVerificationRequest(
  userId: string,
  id: string,
): Promise<EmailVerification | null> {
  console.log(id);

  const [row] = await db
    .select()
    .from(emailVerificationsTable)
    .where(
      and(
        // eq(emailVerificationsTable.id, id),
        eq(emailVerificationsTable.userId, userId),
      ),
    );
  // const row = db.queryOne(
  // 	"SELECT id, user_id, code, email, expires_at FROM email_verification_request WHERE id = ? AND user_id = ?",
  // 	[id, userId]
  // );
  if (row === null) {
    return row;
  }

  const request: EmailVerification = {
    // id: row.string(0),
    // userId: row.number(1),
    // code: row.string(2),
    // email: row.string(3),
    // expiresAt: new Date(row.number(4) * 1000)
    id: row.id,
    userId: row.userId,
    code: row.code,
    email: row.email,
    expiresAt: row.expiresAt,
  };
  return request;
}

export async function createEmailVerificationRequest(
  userId: string,
  email: string,
): Promise<EmailVerification> {
  await deleteUserEmailVerificationRequest(userId);

  const idBytes = new Uint8Array(20);

  crypto.getRandomValues(idBytes);

  const id = encodeBase32(idBytes).toLowerCase();

  const code = generateRandomOTP();

  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  await db
    .insert(emailVerificationsTable)
    .values({ userId, code, email, expiresAt });
  // db.queryOne(
  // 	"INSERT INTO email_verification_request (id, user_id, code, email, expires_at) VALUES (?, ?, ?, ?, ?) RETURNING id",
  // 	[id, userId, code, email, Math.floor(expiresAt.getTime() / 1000)]
  // );

  const request: EmailVerification = {
    id,
    userId,
    code,
    email,
    expiresAt,
  };
  return request;
}

export async function deleteUserEmailVerificationRequest(
  userId: string,
): Promise<void> {
  await db
    .delete(emailVerificationsTable)
    .where(eq(emailVerificationsTable.userId, userId));
  // db.execute("DELETE FROM email_verification_request WHERE user_id = ?", [userId]);
}

export function sendVerificationEmail(email: string, code: string): void {
  console.log(`To ${email}: Your verification code is ${code}`);

  // await sendEmail({
  //   html: `<a href="${url}">Verify your email</a>`,
  //   subject: "Verify your email",
  //   to: email,
  // });
}

export async function setEmailVerificationRequestCookie(
  c: Context,
  request: EmailVerification,
): Promise<void> {
  // (await cookies()).set("email_verification", request.id, {
  //   httpOnly: true,
  //   path: "/",
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   expires: request.expiresAt,
  // });
  setCookie(c, "email_verification", request.id, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: request.expiresAt,
  });
}

export async function deleteEmailVerificationRequestCookie(
  // c: Context,
): Promise<void> {
  (await cookies()).set("email_verification", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
  // deleteCookie(c, "email_verification", {
  //   httpOnly: true,
  //   path: "/",
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   maxAge: 0,
  // });
}

export async function getUserEmailVerificationRequestFromRequest(
  // c: Context,
): Promise<EmailVerification | null> {
  const { user } = await getCurrentSession();

  if (user === null) {
    return null;
  }

  const id = (await cookies()).get("email_verification")?.value ?? null;
  // const id = getCookie(c, "email_verification") ?? null;

  if (id === null) {
    return null;
  }

  const request = await getUserEmailVerificationRequest(user.id, id);

  if (request === null) {
    await deleteEmailVerificationRequestCookie();
  }

  return request;
}
