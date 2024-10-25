"use server";

import { generateState } from "arctic";

import { facebook } from "@/lib/auth/oauth";
import { getErrorMessages } from "@/lib/error-message";

export const createFacebookAuthorizationURL = async () => {
  try {
    const state = generateState();

    const authorizationURL = facebook.createAuthorizationURL(state, [
      "email",
      "public_profile",
    ]);

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
