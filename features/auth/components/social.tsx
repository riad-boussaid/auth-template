"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createGoogleAuthorizationURL,
  createFacebookAuthorizationURL,
} from "@/actions/auth";

export const Social = () => {
  const onGoogleSignInClicked = async () => {
    console.debug("google sign in clicked");

    const res = await createGoogleAuthorizationURL();
    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      window.location.href = res.data.toString();
    }
  };

  const onFacebookSignInClicked = async () => {
    console.debug("facebook sign in clicked");

    const res = await createFacebookAuthorizationURL();
    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      window.location.href = res.data.toString();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="lg"
        className="w-full rounded-md"
        variant="outline"
        onClick={onGoogleSignInClicked}
      >
        Continue with
        <FcGoogle className="ml-2 size-5" />
      </Button>

      <Button
        size="lg"
        className="w-full rounded-md"
        variant="outline"
        onClick={onFacebookSignInClicked}
      >
        Continue with
        <FaFacebook className="ml-2 size-5" />
      </Button>
    </div>
  );
};
