"use client";

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
    <nav className="grid gap-4 text-sm text-muted-foreground ">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "font-semibold ",
            item.label.toLowerCase() === tab?.toLowerCase()
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}

      {/* <Link href={`${pathname}?tab=display`}>Display</Link>

      <Link href="#">Security</Link>
      <Link href="#">Support</Link>
      <Link href="#">Organizations</Link>
      <Link href="#">Advanced</Link> */}
    </nav>
  );
};
