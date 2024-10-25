import { AppSidebar } from "@/components/app-sidebar";
import { MainHeader } from "@/components/main-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <MainHeader />
        {/* <SidebarTrigger /> */}
        <div className="container">{children}</div>
      </main>
    </SidebarProvider>
  );
}
