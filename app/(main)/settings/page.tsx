import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsernameForm } from "./_components/username-form";
import { PasswordForm } from "./_components/password-form";
import { SettingsNav } from "./_components/settings-nav";
import { ChangeTheme } from "./_components/change-theme";

// export const description =
//   "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { tab: string };
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/");

  const tab = searchParams?.tab;

  // const data = await db.query.usersTable.findFirst({
  //   where: eq(usersTable.id, user.id),
  // });

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <main className="flex  flex-col gap-4  md:gap-y-8 md:py-10">
        <div className=" container  grid w-full  gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="  grid w-full container items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <SettingsNav />

          <div className="grid gap-6">
            {tab === "general" && (
              <>
                <UsernameForm />
                <PasswordForm />
              </>
            )}

            {tab === "display" && <ChangeTheme />}

            {tab === "security" && <div>comming soon...</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
