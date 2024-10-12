import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { generateId } from "lucia";

import { db } from "@/lib/db";
import { accountsTable, usersTable } from "@/lib/db/schema";
import { lucia } from "@/lib/auth";
import { facebook } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const code = searchParams.get("code");

    if (!code) {
      return Response.json(
        { error: "Invalid request" },
        {
          status: 400,
        }
      );
    }

    const { accessToken, accessTokenExpiresAt } =
      await facebook.validateAuthorizationCode(code);

    const facebookRes = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`,
      {
        method: "GET",
      }
    );

    const facebookData = (await facebookRes.json()) as {
      name: string;
      id: string;
      email: string;
      picture: {
        height: number;
        is_silhouette: boolean;
        url: string;
        width: number;
      };
    };

    console.log(facebookData);

    const transactionRes = await db.transaction(async (trx) => {
      try {
        const existingUser = await trx.query.usersTable.findFirst({
          where: (table) => eq(table.email, facebookData.email),
        });

        if (!existingUser) {
          const userId = generateId(15);
          await trx.insert(usersTable).values({
            id: userId,
            email: facebookData.email,
            username: facebookData.name,
            avatar: facebookData.picture.url,
            emailVerified: true,
          });

          await trx.insert(accountsTable).values({
            accessToken,
            expiresAt: accessTokenExpiresAt,
            provider: "facebook",
            providerUserId: facebookData.id,
            userId,
            id: generateId(15),
          });

          return {
            success: true,
            message: "User logged in successfully",
            data: {
              id: userId,
            },
          };
        } else {
          await trx
            .update(accountsTable)
            .set({
              accessToken,
              expiresAt: accessTokenExpiresAt,
            })
            .where(
              and(
                eq(accountsTable.providerUserId, facebookData.id),
                eq(accountsTable.provider, "facebook")
              )
            );
        }

        return {
          success: true,
          message: "User logged in successfully",
          data: {
            id: existingUser?.id,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: getErrorMessages(error),
          data: null,
        };
      }
    });

    if (!transactionRes.success || !transactionRes.data)
      throw new Error(transactionRes.message);

    const session = await lucia.createSession(transactionRes?.data?.id, {
      expiresIn: 60 * 60 * 24 * 30,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL),
      {
        status: 302,
      }
    );
  } catch (error) {
    return Response.json(
      { error: getErrorMessages(error) },
      {
        status: 500,
      }
    );
  }
};
