import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32UpperCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "./db";
import {
  type User,
  type PasswordResetSession,
  usersTable,
  passwordResetSessionsTable,
} from "./db/schema";

export function generateRandomOTP(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes);
  return code;
}

export async function createPasswordResetSession(
  token: string,
  userId: string,
  email: string,
): Promise<PasswordResetSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: generateRandomOTP(),
    emailVerified: false,
  };
  await db.insert(passwordResetSessionsTable).values(session);

  return session;
}

export async function validatePasswordResetSessionToken(
  token: string,
): Promise<PasswordResetSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const [row] = await db
    .select()
    .from(passwordResetSessionsTable)
    .innerJoin(usersTable, eq(passwordResetSessionsTable.userId, usersTable.id))
    .where(eq(passwordResetSessionsTable.id, sessionId));

  if (row === null) {
    return { session: null, user: null };
  }
  const session: PasswordResetSession = {
    // id: row.string(0),
    // userId: row.number(1),
    // email: row.string(2),
    // code: row.string(3),
    // expiresAt: new Date(row.number(4) * 1000),
    // emailVerified: Boolean(row.number(5)),
    id: row.password_reset_sessions.id,
    userId: row.password_reset_sessions.id,
    email: row.password_reset_sessions.email,
    expiresAt: row.password_reset_sessions.expiresAt,
    code: row.password_reset_sessions.code,
    emailVerified: row.password_reset_sessions.emailVerified,
  };
  const user: User = {
    // id: row.number(7),
    // email: row.string(8),
    // username: row.string(9),
    // emailVerified: Boolean(row.number(10)),
    id: row.users.id,
    email: row.users.email,
    username: row.users.username,
    emailVerified: Boolean(row.users.emailVerified),
    avatar: row.users.avatar,
    hashedPassword: row.users.hashedPassword,
    role: row.users.role,
    createdAt: row.users.createdAt,
    updatedAt: row.users.updatedAt,
  };
  if (Date.now() >= session.expiresAt.getTime()) {
    await db
      .delete(passwordResetSessionsTable)
      .where(eq(passwordResetSessionsTable.id, session.id));

    return { session: null, user: null };
  }
  return { session, user };
}

export async function validatePasswordResetSessionRequest(): Promise<PasswordResetSessionValidationResult> {
  const token = cookies().get("password_reset_session")?.value ?? null;

  if (token === null) {
    return { session: null, user: null };
  }

  const result = await validatePasswordResetSessionToken(token);

  if (result.session === null) {
    deletePasswordResetSessionTokenCookie();
  }

  return result;
}

export function setPasswordResetSessionTokenCookie(
  token: string,
  expiresAt: Date,
): void {
  cookies().set("password_reset_session", token, {
    expires: expiresAt,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export function deletePasswordResetSessionTokenCookie(): void {
  cookies().set("password_reset_session", "", {
    maxAge: 0,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null };
