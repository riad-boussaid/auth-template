import { redirect } from "next/navigation";

import { EmailVerificationForm } from "@/features/auth/components/email-verification-form";

import { getCurrentSession } from "@/lib/auth/session";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { email: string };
}) {
  const { session } = await getCurrentSession();

  if (session) redirect("/");

  return <EmailVerificationForm email={searchParams?.email || ""} />;
}
