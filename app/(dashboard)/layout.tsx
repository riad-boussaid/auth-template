import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarTrigger className="absolute right-5 bottom-5 m-4" />

      <div className="dark:bg-background container bg-slate-100 py-8">
        {children}
      </div>
    </SidebarProvider>
  );
}
