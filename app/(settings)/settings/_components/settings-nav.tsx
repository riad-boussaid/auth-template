"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SettingsNav = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const pathname = usePathname();

  const items = [
    // {
    //   id: 1,
    //   label: "General",
    //   href: `${pathname}?tab=general`,
    // },
    {
      id: 2,
      label: "Account",
      href: `${pathname}?tab=account`,
    },
    {
      id: 3,
      label: "Security",
      href: `${pathname}?tab=security`,
    },
    {
      id: 4,
      label: "Appearance",
      href: `${pathname}?tab=appearance`,
    },
  ] as const;

  return (
    <nav className="grid gap-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <Button
          key={item.id}
          variant={
            item.label.toLowerCase() === tab?.toLowerCase()
              ? "default"
              : "ghost"
          }
          className="justify-start rounded-full"
          asChild
        >
          <Link href={item.href} className={cn("font-semibold")}>
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
};
