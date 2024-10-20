import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono().post("/delete", async (c) => {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.delete(usersTable).where(eq(usersTable.id, user.id));

    return c.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return c.json({ success: false, message: getErrorMessages(error) });
  }
});

export default app;
