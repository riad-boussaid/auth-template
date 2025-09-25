import { Footer } from "@/components/footer";
import { MainHeader } from "@/components/main-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <MainHeader />
      <div className="dark:bg-background container bg-slate-100">
        {children}
      </div>
      <Footer />
    </div>
  );
}
