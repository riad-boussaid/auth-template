import { createTOTPKeyURI } from "@oslojs/otp";
import { encodeBase64 } from "@oslojs/encoding";
import { redirect } from "next/navigation";
import { renderSVG } from "uqr";

import { getCurrentSession } from "@/lib/auth/session";

import { TwoFactorSetupForm } from "@/features/auth/components/two-factor-setup-form";

export default async function page() {
  const { session, user } = await getCurrentSession();

  if (session === null) redirect("/sign-in");

  if (!user.emailVerified) redirect("/email-verification");

  if (user.totpKey && !session.twoFactorVerified) redirect("/2fa");

  const totpKey = new Uint8Array(20);

  crypto.getRandomValues(totpKey);

  const issuer = "My app";
  const accountName = user.email!;
  const digits = 6;
  const intervalInSeconds = 30;

  const encodedTOTPKey = encodeBase64(totpKey);

  const keyURI = createTOTPKeyURI(
    issuer,
    accountName,
    totpKey,
    intervalInSeconds,
    digits,
  );

  const secret = keyURI.split("secret=")[1].split("&")[0];

  const qrcode = renderSVG(keyURI);

  return (
    <TwoFactorSetupForm
      encodedTOTPKey={encodedTOTPKey}
      secret={secret}
      qrcode={qrcode}
    />
  );
}
