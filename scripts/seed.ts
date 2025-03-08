import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { usersTable } from "@/lib/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const db = drizzle(pool);

  const user: typeof usersTable.$inferInsert = {
    username: "John",
    email: "john@example.com",
    recoveryCode: ""
  };

  await db.insert(usersTable).values(user);
  console.log("New user created!");

  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  //   await db
  //     .update(usersTable)
  //     .set({
  //       age: 31,
  //     })
  //     .where(eq(usersTable.email, user.email));
  //   console.log("User info updated!");

  //   await db.delete(usersTable).where(eq(usersTable.email, user.email));
  //   console.log("User deleted!");
}

main();
