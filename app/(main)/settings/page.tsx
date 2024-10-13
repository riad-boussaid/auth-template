import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsernameForm } from "./_components/username-form";
import { PasswordForm } from "./_components/password-form";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/lib/db/schema";

export const description =
  "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";

export default async function SettingsPage() {
  const { user } = await validateRequest();

  if (!user) redirect("/");

  const data = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, user.id),
  });

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link href="#" className="font-semibold text-primary">
              General
            </Link>
            <Link href="#">Security</Link>
            <Link href="#">Integrations</Link>
            <Link href="#">Support</Link>
            <Link href="#">Organizations</Link>
            <Link href="#">Advanced</Link>
          </nav>
          <div className="grid gap-6">
            <UsernameForm />

            <PasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
