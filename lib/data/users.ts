import "server-only";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { User, usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";

export const getUsers = async () => {
  try {
    const data: User[] = await db.select().from(usersTable).orderBy(asc(usersTable.role));

    return { data };
  } catch (error) {
    return { error: getErrorMessages(error) };
  }
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
