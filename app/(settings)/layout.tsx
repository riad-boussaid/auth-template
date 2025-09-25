import { MainHeader } from "@/components/main-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <MainHeader />
      <div className="dark:bg-background container min-h-[calc(100dvh-80px)] bg-slate-100 py-8">
        {children}
      </div>
    </div>
  );
}
