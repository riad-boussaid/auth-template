import { redirect } from "next/navigation";
import { SettingsNav } from "./_components/settings-nav";
import { ChangeTheme } from "./_components/change-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";

import { UsernameForm } from "@/features/user/components/username-form";
import { PasswordForm } from "@/features/user/components/password-form";
import { ChangeProfilePicture } from "@/features/user/components/profile-picture-form";
import { DeleteAccount } from "@/features/user/components/delete-account-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { tab: string };
}) {
  const { user } = await getCurrentSession();

  if (!user) redirect("/");

  const tab = searchParams?.tab;

  return (
    <main className="flex flex-col gap-4 md:gap-y-8">
      <div className="container grid w-full gap-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      <div
        className={cn(
          "container grid w-full items-start gap-6",
          tab && "md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]",
        )}
      >
        {tab && <SettingsNav />}

        <div className="grid gap-6">
          {!tab && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={"/settings?tab=general"}>
                      <p className="text-xs">Go to Setting</p>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={"/settings?tab=appearance"}>
                      <p className="text-xs">Go to Setting</p>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={"/settings?tab=security"}>
                      <p className="text-xs">Go to Setting</p>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* {tab === "general" && <div>comming soon...</div>} */}

          {tab === "account" && (
            <>
              <UsernameForm />
              <ChangeProfilePicture imageUrl={user.avatar} />
              <DeleteAccount />
            </>
          )}

          {tab === "security" && (
            <>
              <PasswordForm />
            </>
          )}

          {tab === "appearance" && <ChangeTheme />}
        </div>
      </div>
    </main>
  );
}
