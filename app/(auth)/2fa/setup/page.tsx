import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { renderSVG } from "uqr";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { TwoFactorSetupForm } from "@/features/auth/components/two-factor-setup-form";

export default async function page() {
  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  if (!user.emailVerified) {
    return redirect("/verify-email");
  }

  if (user.totpKey && !session.twoFactorVerified) {
    return redirect("/2fa");
  }

  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI("Demo", user.username!, totpKey, 30, 6);
  const qrcode = renderSVG(keyURI);

  return <TwoFactorSetupForm encodedTOTPKey={encodedTOTPKey} qrcode={qrcode} />;
}
