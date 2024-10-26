import "server-only";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { Session, sessionsTable, User, usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";

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
