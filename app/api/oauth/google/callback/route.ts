import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { type GoogleTokens } from "arctic";

import { db } from "@/lib/db";
import { accountsTable, usersTable } from "@/lib/db/schema";
import { google } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";
// import { generateRandomString } from "@oslojs/crypto/random";

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
}

export const GET = async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const savedState = (await cookies()).get("state")?.value ?? null;
    const codeVerifier = (await cookies()).get("codeVerifier")?.value ?? null;

    if (!code || !state) {
      return Response.json(
        { error: "Invalid request" },
        {
          status: 400,
        },
      );
    }

    if (!codeVerifier || !savedState) {
      return Response.json(
        { error: "Code verifier or saved state is not exists" },
        {
          status: 400,
        },
      );
    }

    if (savedState !== state) {
      return Response.json(
        {
          error: "State does not match",
        },
        {
          status: 400,
        },
      );
    }

    let tokens: GoogleTokens;

    try {
      tokens = await google.validateAuthorizationCode(code, codeVerifier);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Invalid code or client credentials
      return Response.json({
        error: "Invalid code or client credentials",
        status: 400,
      });
    }

    // const claims = decodeIdToken(tokens.idToken());
    // const googleUserId = claims.sub;
    // const username = claims.name;

    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    const googleData = (await googleResponse.json()) as GoogleUser;

    console.log(googleData);

    await db.transaction(async (trx) => {
      const existingUser = await trx.query.usersTable.findFirst({
        where: eq(usersTable.email, googleData.email),
      });
      console.debug("User", existingUser);
      // let session = null;

      if (!existingUser) {
        console.log("Creating user", existingUser);
        // const userId = generateRandomString(
        //   {
        //     read(bytes: Uint8Array): void {
        //       crypto.getRandomValues(bytes);
        //     },
        //   },
        //   "abcdefghijklmnopqrstuvwxyz0123456789",
        //   15
        // );
        const createdUserRes = await trx
          .insert(usersTable)
          .values({
            id: googleData.id,
            email: googleData.email,
            username: googleData.name,
            avatar: googleData.picture,
            emailVerified: true,
          })
          .returning({
            id: usersTable.id,
          });

        if (createdUserRes.length === 0) {
          trx.rollback();
          return Response.json(
            { error: "Failed to create user" },
            {
              status: 500,
            },
          );
        }

        const createdOAuthAccountRes = await trx.insert(accountsTable).values({
          id: googleData.id,
          provider: "google",
          providerUserId: googleData.id,
          userId: googleData.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.accessTokenExpiresAt,
        });

        if (createdOAuthAccountRes.rowCount === 0) {
          trx.rollback();
          return Response.json(
            { error: "Failed to create OAuthAccountRes" },
            {
              status: 500,
            },
          );
        }
      } else {
        const updatedOAuthAccountRes = await trx
          .update(accountsTable)
          .set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.accessTokenExpiresAt,
          })
          .where(eq(accountsTable.id, googleData.id));

        if (updatedOAuthAccountRes.rowCount === 0) {
          trx.rollback();
          return Response.json(
            { error: "Failed to update OAuthAccountRes" },
            {
              status: 500,
            },
          );
        }
      }

      return NextResponse.redirect(
        new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL),
        {
          status: 302,
        },
      );
    });

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, googleData.id);
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
