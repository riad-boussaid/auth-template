import { redirect } from "next/navigation";

import { DataTable } from "@/components/data-table";
import { DashboardTablecolumns } from "./_components/dashboard-table-columns";

import { getCurrentSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/data/users";

export default async function UsersPage() {
  const { session, user } = await getCurrentSession();
  if (session === null) {
    return redirect("/sign-in");
  }

  if (user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { data: users, error } = await getUsers();

  if (error) console.log(error);

  return (
    <div className="container space-y-8 mt-8">
      <div className="grid w-full gap-2">
        <h1 className="text-2xl font-semibold">Users Table</h1>
      </div>
      <DataTable columns={DashboardTablecolumns} data={users || []} />
    </div>
  );
}
