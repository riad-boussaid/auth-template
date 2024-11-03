import "server-only";
import { createMiddleware } from "hono/factory";
// import { HTTPException } from "hono/http-exception";

import { getCurrentSession } from "@/lib/auth/session";
import { type Session, type User } from "@/lib/db/schema";

type AdditionalContext = {
  Variables: {
    session: Session;
    user: User;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const { session, user } = await getCurrentSession();

    if (!session || !user) {
      //   throw new HTTPException(401, { message: "Unauthorized" });
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    c.set("session", session);
    c.set("user", user);

    await next();
  },
);
