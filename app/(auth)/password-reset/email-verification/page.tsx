import { redirect } from "next/navigation";

import { PasswordResetEmailVerificationForm } from "@/features/auth/components/password-reset-email-verification-form";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";

export default async function PasswordResetEmailVerification() {
  const { session } = await validatePasswordResetSessionRequest();
  if (session === null) {
    return redirect("/forgot-password");
  }
  if (session.emailVerified) {
    return redirect("/password-reset");
  }
  return <PasswordResetEmailVerificationForm />;
}
