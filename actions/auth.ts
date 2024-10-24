"use server";

import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

import { facebook, google } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";

export const createGoogleAuthorizationURL = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const authorizationURL = google.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      },
    );

    (await cookies()).set("state", state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    (await cookies()).set("codeVerifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    return {
      success: true,
      data: authorizationURL.toString(),
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};

export const createFacebookAuthorizationURL = async () => {
  try {
    const state = generateState();

    const authorizationURL = facebook.createAuthorizationURL(state, {
      scopes: ["email", "public_profile"],
    });

    return {
      success: true,
      data: authorizationURL.toString(),
    };
  } catch (error) {
    return {
      error: getErrorMessages(error),
    };
  }
};
