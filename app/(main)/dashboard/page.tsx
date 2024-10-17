import { redirect } from "next/navigation";

import { DashboardTable } from "./_components/dashboard-table";
import { DashboardTablecolumns } from "./_components/dashboard-table-columns";

import { getCurrentSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/data/users";

export default async function DashboardPage() {
  const { user } = await getCurrentSession();

  if (!user) redirect("/");

  if (user.role !== "ADMIN") redirect("/");

  const { data: users, error } = await getUsers();

  if (error) console.log(error);

  return (
    <div className="container min-h-[calc(100dvh-80px)] space-y-8 py-8">
      <div className="grid w-full gap-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
      </div>
      <DashboardTable columns={DashboardTablecolumns} data={users || []} />
    </div>
  );
}
