import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarTrigger className="m-4 absolute bottom-5 right-5" />

      <div className="container bg-slate-100 py-8 dark:bg-background">
        {children}
      </div>
    </SidebarProvider>
  );
}
