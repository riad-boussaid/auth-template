import { redirect } from "next/navigation";

import { PasswordResetEmailVerificationForm } from "@/features/auth/components/password-reset-email-verification-form";
import { validatePasswordResetSessionRequest } from "@/lib/auth/password-reset";

export default async function PasswordResetEmailVerification() {
  const { session } = await validatePasswordResetSessionRequest();

  if (session === null) redirect("/forgot-password");

  if (session.emailVerified) {
    if (!session.twoFactorVerified) redirect("/password-reset/2fa");

    redirect("/password-reset");
  }

  return <PasswordResetEmailVerificationForm />;
}
