"use client";

import { CardWrapper } from "./card-wrapper";

export const SigninForm = () => {
  return (
    <CardWrapper
      headerTitle="Sign in"
      headerLabel="Welcome back"
      showSocial={true}
    //   backButtonLabel="go Back"
      backButtonHref={"/"}
    >
      {null}
    </CardWrapper>
  );
};
