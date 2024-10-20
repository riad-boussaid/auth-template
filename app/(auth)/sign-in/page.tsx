import { redirect } from "next/navigation";

import { SigninForm } from "@/features/auth/components/signin-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function SigninPage() {
  const { session } = await getCurrentSession();

  if (session) redirect("/");

  return <SigninForm />;
}
