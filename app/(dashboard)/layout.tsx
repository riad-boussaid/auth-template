import { MainHeader } from "@/components/main-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainHeader />
      <div className="min-h-[calc(100dvh-80px)] bg-gray-50 py-8 dark:bg-gray-950">
        {children}
      </div>
    </div>
  );
}
