import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

import { TwoFactorVerificationForm } from "@/features/auth/components/two-factor-verification-form";

export default async function TwoFactorAuthonticationPage() {
  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  if (!user.emailVerified) {
    return redirect("/email-verification");
  }

  if (!user.totpKey) {
    return redirect("/2fa/setup");
  }

  if (session.twoFactorVerified) {
    return redirect("/");
  }

  return <TwoFactorVerificationForm />;
}
