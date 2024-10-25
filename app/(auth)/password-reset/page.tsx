import { redirect } from "next/navigation";

import { PasswordResetForm } from "@/features/auth/components/password-reset-form";
import { validatePasswordResetSessionRequest } from "@/lib/auth/password-reset";

export default async function PasswordResetPage() {
  const { session } = await validatePasswordResetSessionRequest();

  if (session === null) {
    return redirect("/forgot-password");
  }
  
  if (!session.emailVerified) {
    return redirect("/password-reset/email-verification");
  }
  return <PasswordResetForm />;
}
