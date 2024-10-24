import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  if (user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  redirect("/dashboard/users");
}
