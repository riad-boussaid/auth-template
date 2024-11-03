"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

import { Button } from "@/components/ui/button";

import { useCreateGoogleAuthorizationUrl } from "@/features/oauth/api/use-create-google-authorization-url";
import { useCreateFacebookAuthorizationUrl } from "@/features/oauth/api/use-create-facebook-authorization-url";

export const Social = () => {
  const { mutate: mutateGoogle, isPending: isPendingGoogle } =
    useCreateGoogleAuthorizationUrl();

  const { mutate: mutateFacebook, isPending: isPendingFacebook } =
    useCreateFacebookAuthorizationUrl();

  const onGoogleSignInClicked = async () => {
    mutateGoogle({});
  };

  const onFacebookSignInClicked = async () => {
    mutateFacebook({});
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        disabled={isPendingGoogle}
        size="lg"
        variant="outline"
        className="w-full"
        onClick={onGoogleSignInClicked}
      >
        Continue with
        <FcGoogle className="ml-2 size-5" />
      </Button>

      <Button
        disabled={isPendingFacebook}
        size="lg"
        variant="outline"
        className="w-full"
        onClick={onFacebookSignInClicked}
      >
        Continue with
        <FaFacebook className="ml-2 size-5" />
      </Button>
    </div>
  );
};
