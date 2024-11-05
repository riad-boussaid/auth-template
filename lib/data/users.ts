import "server-only";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  accountsTable,
  Session,
  sessionsTable,
  User,
  usersTable,
} from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";
import { decrypt, decryptToString } from "../encryption";

export const getUsers = async () => {
  try {
    const data: User[] = await db
      .select()
      .from(usersTable)
      .orderBy(asc(usersTable.role));

    return { data };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};

export const getUserSessions = async (userId: string) => {
  const data: Session[] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .orderBy(desc(sessionsTable.createdAt));

  return { data };
};

export const getUserAccounts = async (userId: string) => {
  const data = await db
    .select({ id: accountsTable.id, provider: accountsTable.provider })
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));

  return { data };
};

export const getUserById = async (userId: string) => {
  try {
    const [data]: User[] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    return { data };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
};

export const getUserRecoveryCode = async (userId: string) => {
  const [result] = await db
    .select({ recoveryCode: usersTable.recoveryCode })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (result === null) {
    throw new Error("Invalid userId");
  }

  // return decryptToString(result.totpKey)
  return result.recoveryCode;
};

export const getUserTOTPKey = async (userId: string) => {
  const [result] = await db
    .select({ totpKey: usersTable.totpKey })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (result === null) {
    throw new Error("Invalid userId");
  }

  // return decrypt(result.totpKey as unknown as Uint8Array);
  return result.totpKey;
};
