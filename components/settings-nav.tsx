"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleUser, Lock, Monitor, Palette } from "lucide-react";

export const SettingsNav = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const pathname = usePathname();

  const items = [
    {
      id: 2,
      label: "Account",
      href: `${pathname}?tab=account`,
      icon: CircleUser,
    },
    {
      id: 3,
      label: "Security",
      href: `${pathname}?tab=security`,
      icon: Lock,
    },
    {
      id: 4,
      label: "Sessions",
      href: `${pathname}?tab=sessions`,
      icon: Monitor,
    },
    {
      id: 5,
      label: "Appearance",
      href: `${pathname}?tab=appearance`,
      icon: Palette,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

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
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};
