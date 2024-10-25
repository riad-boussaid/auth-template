import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SettingsNav } from "@/components/settings-nav";
import { ChangeTheme } from "@/components/change-theme";

import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";

import { UpdateUsernameForm } from "@/features/user/components/update-username-form";
import { UpdatePasswordForm } from "@/features/user/components/update-password-form";
import { UpdateAvatarForm } from "@/features/user/components/update-avatar-form";
import { DeleteUserForm } from "@/features/user/components/delete-user-form";
import { SessionsForm } from "@/features/user/components/sessions-form";
import { getUserSessions } from "@/lib/data/users";

export default async function SettingsPage(props: {
  searchParams?: Promise<{ tab: string }>;
}) {
  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  const searchParams = await props.searchParams;
  const tab = searchParams?.tab;

  const { data: userSessions } = await getUserSessions(user.id);

  return (
    <main className="flex flex-col gap-4 md:gap-y-8">
      <div
        className={cn(
          "grid w-full items-start gap-6",
          tab && "md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]",
        )}
      >
        {tab && <SettingsNav />}

        <div className="grid gap-6">
          {!tab && (
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
          )}

          {/* {tab === "general" && <div>comming soon...</div>} */}

          {tab === "account" && (
            <>
              <UpdateUsernameForm />
              <UpdateAvatarForm
                imageUrl={user.avatar}
                username={user.username}
              />
              <DeleteUserForm />
            </>
          )}

          {tab === "security" && (
            <>
              <UpdatePasswordForm />
            </>
          )}

          {tab === "sessions" && (
            <>
              <SessionsForm sessions={userSessions} />
            </>
          )}

          {tab === "appearance" && <ChangeTheme />}
        </div>
      </div>
    </main>
  );
}
