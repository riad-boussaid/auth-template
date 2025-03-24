import { redirect } from "next/navigation";

import { PasswordResetForm } from "@/features/auth/components/password-reset-form";
import { validatePasswordResetSessionRequest } from "@/lib/auth/password-reset";

export default async function PasswordResetPage() {
  const { session, user } = await validatePasswordResetSessionRequest();

  if (session === null) redirect("/forgot-password");

  if (!session.emailVerified) redirect("/password-reset/email-verification");

  if (user.totpKey && !session.twoFactorVerified)
    redirect("/password-reset/2fa");

  return <PasswordResetForm />;
}
