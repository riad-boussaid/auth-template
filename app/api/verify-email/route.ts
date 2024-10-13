import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { db } from "@/lib/db";
import { emailVerificationTable, usersTable } from "@/lib/db/schema";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { getErrorMessages } from "@/lib/error-message";

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
        }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      code: string;
      userId: string;
    };

    const emailVerificationQueryResult =
      await db.query.emailVerificationTable.findFirst({
        where:
          eq(emailVerificationTable.userId, decoded.userId) &&
          eq(emailVerificationTable.code, decoded.code),
      });

    if (!emailVerificationQueryResult) {
      return Response.json(
        {
          error: "Invalid token",
        },
        {
          status: 400,
        }
      );
    }

    await db
      .delete(emailVerificationTable)
      .where(eq(emailVerificationTable.userId, decoded.userId));

    await db
      .update(usersTable)
      .set({
        emailVerified: true,
      })
      .where(eq(usersTable.email, decoded.email));

    const session = await lucia.createSession(decoded.userId, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return Response.redirect(new URL(process.env.NEXT_PUBLIC_APP_URL!), 302);
  } catch (error) {
    return Response.json(
      {
        error: getErrorMessages(error),
      },
      {
        status: 400,
      }
    );
  }
};
