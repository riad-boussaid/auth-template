import { MainHeader } from "@/components/main-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainHeader />
      <div className="min-h-[calc(100dvh-80px)] bg-gray-50 py-8 dark:bg-background">
        {children}
      </div>
    </div>
  );
}
