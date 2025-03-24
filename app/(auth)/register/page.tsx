import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const { session, user } = await getCurrentSession();

  if (session !== null) {
    if (!user.emailVerified) redirect("/email-verification");

    if (!user.totpKey) redirect("/2fa/setup");

    if (!session.twoFactorVerified) redirect("/2fa");

    redirect("/");
  }

  return <RegisterForm />;
}
