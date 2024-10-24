import { redirect } from "next/navigation";

import { EmailVerificationForm } from "@/features/auth/components/email-verification-form";

import { getCurrentSession } from "@/lib/auth/session";
import { getUserEmailVerificationRequestFromRequest } from "@/lib/auth/email-verification";

export default async function VerifyEmailPage() {
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/sign-in");
  }

  const verificationRequest =
    await getUserEmailVerificationRequestFromRequest();
  if (verificationRequest === null && user.emailVerified) {
    return redirect("/");
  }

  return <EmailVerificationForm />;
}
