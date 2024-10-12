import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardPage() {
  const { user } = await validateRequest();

  if (!user) redirect("/");

  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-[calc(100dvh-80px)] container py-8">
      DashboardPage
    </div>
  );
}
