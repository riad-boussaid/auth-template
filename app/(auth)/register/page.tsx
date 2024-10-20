import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const { session } = await getCurrentSession();

  if (session) redirect("/");

  return <RegisterForm />;
}
