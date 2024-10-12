import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { db } from "@/lib/db";
import { sessionTable, usersTable } from "@/lib/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, usersTable);

export default adapter;
