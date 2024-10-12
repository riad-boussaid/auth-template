import { MainHeader } from "@/components/main-header";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <MainHeader />
      {children}
    </div>
  );
}
