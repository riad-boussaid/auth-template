import { redirect } from "next/navigation";
import { UsernameForm } from "./_components/username-form";
import { PasswordForm } from "./_components/password-form";
import { SettingsNav } from "./_components/settings-nav";
import { ChangeTheme } from "./_components/change-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth/session";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { tab: string };
}) {
  const { user } = await getCurrentSession();

  if (!user) redirect("/");

  const tab = searchParams?.tab;

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <main className="flex  flex-col gap-4  md:gap-y-8 md:py-10">
        <div className=" container  grid w-full  gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div
          className={cn(
            "grid w-full container items-start gap-6 ",
            tab && "md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]"
          )}
        >
          {tab && <SettingsNav />}

          <div className="grid gap-6">
            {!tab && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
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
                      <CardTitle>Display</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link href={"/settings?tab=display"}>
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

            {tab === "general" && (
              <>
                <UsernameForm />
              </>
            )}

            {tab === "display" && <ChangeTheme />}

            {tab === "security" && <PasswordForm />}
          </div>
        </div>
      </main>
    </div>
  );
}
