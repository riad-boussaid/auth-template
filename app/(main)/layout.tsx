import { MainHeader } from "@/components/main-header";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <MainHeader />
      {children}
    </div>
  );
}
