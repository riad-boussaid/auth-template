import { MainHeader } from "@/components/main-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <MainHeader />
      <div className="container min-h-[calc(100dvh-80px)] py-8 dark:bg-background">
        {children}
      </div>
    </div>
  );
}
