import { redirect } from "next/navigation";

import { TwoFactorResetForm } from "@/features/auth/components/two-factor-reset-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function Page() {
  const { session, user } = await getCurrentSession();

  if (session === null) redirect("/sign-in");

  if (!user.emailVerified) redirect("/email-verification");

  if (!user.totpKey) redirect("/2fa/setup");

  if (session.twoFactorVerified) redirect("/");

  return <TwoFactorResetForm />;
}
