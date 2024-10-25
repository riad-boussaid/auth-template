import { Hono } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { ObjectParser } from "@pilcrowjs/object-parser";
import {
  ArcticFetchError,
  decodeIdToken,
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
  type OAuth2Tokens,
} from "arctic";

import { db } from "@/lib/db";
import { accountsTable, usersTable } from "@/lib/db/schema";
import { google } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  picture: string;
  locale: string;
}

const app = new Hono()
  .post("/createGoogleAuthorizationURL", async (c) => {
    try {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const authorizationURL = google.createAuthorizationURL(
        state,
        codeVerifier,
        ["email", "profile"],
      );

      (await cookies()).set("google_oauth_state", state, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
      });

      (await cookies()).set("google_code_verifier", codeVerifier, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
      });

      return c.json({
        success: true,
        message: "Google Authorization url created successfully ",
        data: authorizationURL.toString(),
      });
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
        data: "",
      });
    }
  })
  .get("/google/callback", async (c) => {
    try {
      const url = new URL(c.req.url);

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      const storedState =
        (await cookies()).get("google_oauth_state")?.value ?? null;

      const codeVerifier =
        (await cookies()).get("google_code_verifier")?.value ?? null;

      if (
        code === null ||
        state === null ||
        codeVerifier === null ||
        storedState === null
      ) {
        throw new HTTPException(400, { message: "Invalid request" });
      }

      if (storedState !== state) {
        throw new HTTPException(400, { message: "State does not match" });
      }

      let tokens: OAuth2Tokens;

      try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
      } catch (error) {
        throw new HTTPException(400, {
          message: getErrorMessages(error),
        });
        // if (error instanceof OAuth2RequestError) {
        //   // Invalid authorization code, credentials, or redirect URI
        //   const code = error.code;
        //   // ...

        //   throw new HTTPException(400, {
        //     message: "Invalid authorization code, credentials, or redirect URI",
        //   });
        // }
        // if (error instanceof ArcticFetchError) {
        //   // Failed to call `fetch()`
        //   const cause = error.cause;
        //   // ...
        //   throw new HTTPException(400, {
        //     message: "Failed to call `fetch()`",
        //   });
        // }
        // // Parse error
      }

      const accessToken = tokens.accessToken();
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();

      const claims = decodeIdToken(tokens.idToken());
      const claimsParser = new ObjectParser(claims);

      const googleId = claimsParser.getString("sub");
      const username = claimsParser.getString("name");
      const email = claimsParser.getString("email");
      const picture = claimsParser.getString("picture");

      const { NEXT_PUBLIC_APP_URL } = env<{ NEXT_PUBLIC_APP_URL: string }>(c);

      // let createdUserRes: { id: string }[];
      const transactionResponse = await db.transaction(async (trx) => {
        try {
          const [existingUser] = await trx
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

          if (!existingUser) {
            const [createdUserRes] = await trx
              .insert(usersTable)
              .values({
                email,
                username,
                avatar: picture,
                emailVerified: true,
              })
              .returning({
                id: usersTable.id,
              });

            if (!createdUserRes) {
              trx.rollback();

              throw new HTTPException(500, {
                message: "Failed to create user",
              });
            }

            const createdOAuthAccountRes = await trx
              .insert(accountsTable)
              .values({
                provider: "google",
                providerUserId: googleId,
                userId: createdUserRes.id,
                accessToken,
                // refreshToken,
                expiresAt: accessTokenExpiresAt,
              });

            if (createdOAuthAccountRes.rowCount === 0) {
              trx.rollback();

              throw new HTTPException(500, {
                message: "Failed to create OAuthAccountRes",
              });
            }

            return {
              success: true,
              message: "User logged in successfully",
              data: {
                id: createdUserRes.id,
              },
            };
          } else {
            const updatedOAuthAccountRes = await trx
              .update(accountsTable)
              .set({
                accessToken,
                expiresAt: accessTokenExpiresAt,
              })
              .where(eq(accountsTable.providerUserId, googleId));

            if (updatedOAuthAccountRes.rowCount === 0) {
              trx.rollback();

              throw new HTTPException(500, {
                message: "Failed to update OAuthAccountRes",
              });
            }
          }

          return {
            success: true,
            message: "User logged in successfully",
            data: {
              id: existingUser.id,
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

      if (!transactionResponse.success || !transactionResponse.data) {
        throw new HTTPException(500, { message: transactionResponse.message });
      }

      const sessionToken = generateSessionToken();
      const session = await createSession(
        sessionToken,
        transactionResponse.data.id,
      );
      await setSessionTokenCookie(sessionToken, session.expiresAt);

      return c.redirect(new URL("/", NEXT_PUBLIC_APP_URL).href, 302);
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  });

export default app;

// export const GET = async (req: NextRequest) => {
//   try {
// await db.transaction(async (trx) => {
//   const [existingUser] = await trx
//     .select()
//     .from(usersTable)
//     .where(eq(usersTable.email, email))
//     .limit(1);

//   console.debug("User", existingUser);
//   // let session = null;

//   if (!existingUser) {
//     console.log("Creating user", existingUser);

//     const createdUserRes = await trx
//       .insert(usersTable)
//       .values({
//         email,
//         username,
//         avatar: picture,
//         emailVerified: true,
//       })
//       .returning({
//         id: usersTable.id,
//       });

//     if (createdUserRes.length === 0) {
//       trx.rollback();

//       return Response.json(
//         { error: "Failed to create user" },
//         {
//           status: 500,
//         },
//       );
//     }

//     const createdOAuthAccountRes = await trx.insert(accountsTable).values({
//       provider: "google",
//       providerUserId: googleId,
//       userId: googleId,
//       accessToken: tokens.accessToken(),
//       refreshToken: tokens.refreshToken(),
//       expiresAt: tokens.accessTokenExpiresAt(),
//     });

//     if (createdOAuthAccountRes.rowCount === 0) {
//       trx.rollback();
//       return Response.json(
//         { error: "Failed to create OAuthAccountRes" },
//         {
//           status: 500,
//         },
//       );
//     }
//   } else {
//     const updatedOAuthAccountRes = await trx
//       .update(accountsTable)
//       .set({
//         accessToken: tokens.accessToken(),
//         refreshToken: tokens.refreshToken(),
//         expiresAt: tokens.accessTokenExpiresAt(),
//       })
//       .where(eq(accountsTable.id, googleId));

//     if (updatedOAuthAccountRes.rowCount === 0) {
//       trx.rollback();
//       return Response.json(
//         { error: "Failed to update OAuthAccountRes" },
//         {
//           status: 500,
//         },
//       );
//     }
//   }

//   return NextResponse.redirect(
//     new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL),
//     {
//       status: 302,
//     },
//   );
// });

//     const sessionToken = generateSessionToken();
//     const session = await createSession(sessionToken, googleId);
//     await setSessionTokenCookie(sessionToken, session.expiresAt);

//     return NextResponse.redirect(
//       new URL("/", process.env.NEXT_PUBLIC_APP_URL),
//       {
//         status: 302,
//       },
//     );
//   } catch (error) {
//     return Response.json(
//       { error: getErrorMessages(error) },
//       {
//         status: 500,
//       },
//     );
//   }
// };
