import { MainHeader } from "@/components/main-header";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      <MainHeader />
      {children}
    </div>
  );
}
