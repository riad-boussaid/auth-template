import { Hono } from "hono";
import { getConnInfo } from "hono/vercel";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { ObjectParser } from "@pilcrowjs/object-parser";
import {
  // ArcticFetchError,
  decodeIdToken,
  generateCodeVerifier,
  generateState,
  // OAuth2RequestError,
  type OAuth2Tokens,
} from "arctic";

import { db } from "@/lib/db";
import { accountsTable, usersTable } from "@/lib/db/schema";
import { facebook, google } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/auth/session";

const app = new Hono()
  .get("/createGoogleAuthorizationURL", async (c) => {
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
            const accounts = await db
              .select()
              .from(accountsTable)
              .where(eq(accountsTable.userId, existingUser.id));

            if (accounts.some((e) => e.provider === "google")) {
              await trx
                .update(accountsTable)
                .set({
                  accessToken,
                  expiresAt: accessTokenExpiresAt,
                })
                .where(eq(accountsTable.providerUserId, googleId));
            } else {
              await trx.insert(accountsTable).values({
                provider: "google",
                providerUserId: googleId,
                userId: existingUser.id,
                accessToken,
                expiresAt: accessTokenExpiresAt,
              });
            }

            // if (updatedOAuthAccountRes.rowCount === 0) {
            //   trx.rollback();

            //   throw new HTTPException(500, {
            //     message: "Failed to update OAuthAccountRes",
            //   });
            // }
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

      const info = getConnInfo(c);

      const sessionToken = generateSessionToken();
      const session = await createSession(
        sessionToken,
        transactionResponse.data.id,
        (info.remote.address ?? "127.0.0.1").split(",")[0],
      );
      await setSessionTokenCookie(sessionToken, session.expiresAt);

      return c.redirect(new URL("/", NEXT_PUBLIC_APP_URL).href, 302);
    } catch (error) {
      return c.json({
        success: false,
        message: getErrorMessages(error),
      });
    }
  })
  .get("/createFacebookAuthorizationUrl", async (c) => {
    try {
      const state = generateState();

      const authorizationURL = facebook.createAuthorizationURL(state, [
        "email",
        "public_profile",
      ]);

      return c.json({
        success: true,
        message: "Facebook authorization url created successfully",
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
  .get("/facebook/callback", async (c) => {
    try {
      const url = new URL(c.req.url);

      const code = url.searchParams.get("code");

      if (code === null) {
        throw new HTTPException(400, { message: "Invalid request" });
      }

      let tokens: OAuth2Tokens;

      try {
        tokens = await facebook.validateAuthorizationCode(code);
      } catch (error) {
        throw new HTTPException(400, {
          message: getErrorMessages(error),
        });
      }

      const accessToken = tokens.accessToken();
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();

      const facebookDataUrl = new URL("https://graph.facebook.com/me");

      facebookDataUrl.searchParams.set("access_token", accessToken);

      facebookDataUrl.searchParams.set(
        "fields",
        ["id", "name", "picture", "email"].join(","),
      );

      const response = await fetch(facebookDataUrl);

      const user = await response.json();

      const facebookId = user.id;
      const username = user.name;
      const email = user.email;
      const picture = user.picture.data.url;

      const { NEXT_PUBLIC_APP_URL } = env<{ NEXT_PUBLIC_APP_URL: string }>(c);

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
                provider: "facebook",
                providerUserId: facebookId,
                userId: createdUserRes.id,
                accessToken,
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
            const accounts = await db
              .select()
              .from(accountsTable)
              .where(eq(accountsTable.userId, existingUser.id));

            if (accounts.some((e) => e.provider === "facebbok")) {
              await trx
                .update(accountsTable)
                .set({
                  accessToken,
                  expiresAt: accessTokenExpiresAt,
                })
                .where(
                  and(
                    eq(accountsTable.providerUserId, facebookId),
                    eq(accountsTable.provider, "facebook"),
                  ),
                );
            } else {
              await trx.insert(accountsTable).values({
                provider: "facebook",
                providerUserId: facebookId,
                userId: existingUser.id,
                accessToken,
                expiresAt: accessTokenExpiresAt,
              });
            }

            // if (updatedOAuthAccountRes.rowCount === 0) {
            //   trx.rollback();

            //   throw new HTTPException(500, {
            //     message: "Failed to update OAuthAccountRes",
            //   });
            // }
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

      const info = getConnInfo(c);

      const sessionToken = generateSessionToken();
      const session = await createSession(
        sessionToken,
        transactionResponse.data.id,
        (info.remote.address ?? "127.0.0.1").split(",")[0],
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
