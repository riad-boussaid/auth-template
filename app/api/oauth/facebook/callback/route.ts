import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { type FacebookTokens } from "arctic";

import { db } from "@/lib/db";
import { accountsTable, usersTable } from "@/lib/db/schema";
import { facebook } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";
import { generateRandomString } from "@oslojs/crypto/random";

interface FacebookUser {
  name: string;
  id: string;
  email: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}

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
        },
      );
    }

    let tokens: FacebookTokens;

    try {
      tokens = await facebook.validateAuthorizationCode(code);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Invalid code or client credentials
      return Response.json({
        error: "Invalid code or client credentials",
        status: 400,
      });
    }

    const facebookResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.accessToken}`,
      {
        method: "GET",
      },
    );

    const facebookData = (await facebookResponse.json()) as FacebookUser;

    console.log(facebookData);

    const transactionResponse = await db.transaction(async (trx) => {
      try {
        const existingUser = await trx.query.usersTable.findFirst({
          where: eq(usersTable.email, facebookData.email),
        });

        if (!existingUser) {
          const userId = generateRandomString(
            {
              read(bytes: Uint8Array): void {
                crypto.getRandomValues(bytes);
              },
            },
            "abcdefghijklmnopqrstuvwxyz0123456789",
            15,
          );
          await trx.insert(usersTable).values({
            id: userId,
            email: facebookData.email,
            username: facebookData.name,
            avatar: facebookData.picture.data.url,
            emailVerified: true,
          });

          await trx.insert(accountsTable).values({
            id: userId,
            provider: "facebook",
            providerUserId: facebookData.id,
            userId,
            accessToken: tokens.accessToken,
            expiresAt: tokens.accessTokenExpiresAt,
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
              accessToken: tokens.accessToken,
              expiresAt: tokens.accessTokenExpiresAt,
            })
            .where(
              and(
                eq(accountsTable.providerUserId, facebookData.id),
                eq(accountsTable.provider, "facebook"),
              ),
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

    if (!transactionResponse.success || !transactionResponse.data)
      throw new Error(transactionResponse.message);

    const sessionToken = generateSessionToken();
    const session = await createSession(
      sessionToken,
      transactionResponse?.data?.id,
    );
    setSessionTokenCookie(sessionToken, session.expiresAt);

    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL),
      {
        status: 302,
      },
    );
  } catch (error) {
    return Response.json(
      { error: getErrorMessages(error) },
      {
        status: 500,
      },
    );
  }
};
