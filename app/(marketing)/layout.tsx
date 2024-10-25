import { Footer } from "@/components/footer";
import { MainHeader } from "@/components/main-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <MainHeader />
      <div className="bg-gray-50 dark:bg-background">{children}</div>
      <Footer />
    </div>
  );
}
