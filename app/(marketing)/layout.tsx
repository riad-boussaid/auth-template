import { MainHeader } from "@/components/main-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MainHeader />
      <div className="bg-gray-50 dark:bg-background">{children}</div>
    </div>
  );
}
