import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const { session, user } = await getCurrentSession();
  if (session !== null) {
    if (!user.emailVerified) {
      return redirect("/email-verification");
    }

    return redirect("/");
  }

  return <RegisterForm />;
}
