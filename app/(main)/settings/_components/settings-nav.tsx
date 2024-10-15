"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

export const SettingsNav = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const pathname = usePathname();

  console.log(pathname);

  const items = [
    {
      id: 1,
      label: "General",
      href: `${pathname}?tab=general`,
    },
    {
      id: 2,
      label: "Display",
      href: `${pathname}?tab=display`,
    },
    {
      id: 3,
      label: "Security",
      href: `${pathname}?tab=security`,
    },
  ] as const;

  return (
    <nav className="grid gap-1 text-sm text-muted-foreground ">
      {items.map((item) => (
        <Button
          key={item.id}
          variant={
            item.label.toLowerCase() === tab?.toLowerCase()
              ? "default"
              : "ghost"
          }
          className="justify-start rounded-lg"
          asChild
        >
          <Link href={item.href} className={cn("font-semibold ")}>
            {item.label}
          </Link>
        </Button>
      ))}

      {/* <Link href={`${pathname}?tab=display`}>Display</Link>

      <Link href="#">Security</Link>
      <Link href="#">Support</Link>
      <Link href="#">Organizations</Link>
      <Link href="#">Advanced</Link> */}
    </nav>
  );
};
