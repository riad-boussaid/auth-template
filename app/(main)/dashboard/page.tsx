import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { DashboardTable } from "./_components/dashboard-table";
import { DashboardTablecolumns } from "./_components/dashboard-table-columns";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { user } = await validateRequest();

  if (!user) redirect("/");

  if (user.role !== "ADMIN") redirect("/");

  const data = await db.query.usersTable.findMany();

  return (
    <div className="min-h-[calc(100dvh-80px)] container py-8 space-y-8">
      <div className="  grid w-full  gap-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
      </div>
      <DashboardTable columns={DashboardTablecolumns} data={data} />
    </div>
  );
}
