import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import jwt from "hono/jwt";

import { db } from "@/lib/db";
import { emailVerificationTable, usersTable } from "@/lib/db/schema";
import { getErrorMessages } from "@/lib/error-message";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);

    const searchParams = url.searchParams;

    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        {
          error: "Token is not existed",
        },
        {
          status: 400,
        },
      );
    }

    const decodedPayload = (await jwt.verify(
      token,
      process.env.JWT_SECRET!,
      "HS256",  
    )) as {
      email: string;
      code: string;
      userId: string;
      expiresIn: Date;
    };

    const emailVerificationQueryResult =
      await db.query.emailVerificationTable.findFirst({
        where: and(
          eq(emailVerificationTable.userId, decodedPayload.userId),
          eq(emailVerificationTable.code, decodedPayload.code),
        ),
      });

    if (!emailVerificationQueryResult) {
      return Response.json(
        {
          error: "Invalid token",
        },
        {
          status: 400,
        },
      );
    }

    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.userId, decodedPayload.userId));

    await db
      .update(usersTable)
      .set({
        emailVerified: true,
      })
      .where(eq(usersTable.email, decodedPayload.email));

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, decodedPayload.userId);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    return Response.redirect(new URL(process.env.NEXT_PUBLIC_APP_URL!), 302);
  } catch (error) {
    return Response.json(
      {
        error: getErrorMessages(error),
      },
      {
        status: 400,
      },
    );
  }
};
