import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  if (session) redirect("/");

  return (
    <div className="min-h-dvh flex items-center justify-center">{children}</div>
  );
}
