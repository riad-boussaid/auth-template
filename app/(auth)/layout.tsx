import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await getCurrentSession();

  if (session) redirect("/");

  return (
    <div className="min-h-dvh flex items-center py-8 justify-center">
      {children}
    </div>
  );
}
