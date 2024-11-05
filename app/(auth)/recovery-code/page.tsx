import { RecoveryCodesForm } from "@/features/auth/components/recovery-codes-form";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserRecoveryCode } from "@/lib/data/users";
import { redirect } from "next/navigation";

export default async function RecoveryCodePage() {
  const { session, user } = await getCurrentSession();

  if (!session) redirect("/sign-in");

  if (!user.emailVerified) redirect("email-verification");

  if (!user.totpKey) redirect("/2fa/setup");

  if (!session.twoFactorVerified) redirect("/2fa");

  const recoveryCode = await getUserRecoveryCode(user.id);

  return <RecoveryCodesForm recoveryCode={recoveryCode} />;
}
