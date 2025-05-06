"use client";

import { useTheme } from "next-themes";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ChangeTheme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Change theme mode</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-x-4 *:cursor-pointer">
        <button disabled={theme === "light"} onClick={() => setTheme("light")}>
          <div
            className={cn(
              "border-muted hover:border-primary hover:bg-accent items-center rounded-md border-2 p-1",
              theme === "light" && "border-primary",
            )}
          >
            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
              <div className="space-y-2 rounded-md bg-white p-2 shadow-xs">
                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">
            Light
          </span>
        </button>
        <button disabled={theme === "dark"} onClick={() => setTheme("dark")}>
          <div
            className={cn(
              "border-muted bg-popover hover:border-primary hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1",
              theme === "dark" && "border-primary",
            )}
          >
            <div className="space-y-2 rounded-sm bg-zinc-950 p-2">
              <div className="space-y-2 rounded-md bg-zinc-800 p-2 shadow-xs">
                <div className="h-2 w-[80px] rounded-lg bg-zinc-400" />
                <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-zinc-800 p-2 shadow-xs">
                <div className="h-4 w-4 rounded-full bg-zinc-400" />
                <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
              </div>
              <div className="flex items-center space-x-2 rounded-md bg-zinc-800 p-2 shadow-xs">
                <div className="h-4 w-4 rounded-full bg-zinc-400" />
                <div className="h-2 w-[100px] rounded-lg bg-zinc-400" />
              </div>
            </div>
          </div>
          <span className="block w-full p-2 text-center font-normal">Dark</span>
        </button>
        <button
          disabled={theme === "system"}
          onClick={() => setTheme("system")}
        >
          <div
            className={cn(
              "border-muted bg-popover hover:border-primary hover:bg-accent hover:text-accent-foreground flex h-[148px]! w-[168px] cursor-pointer items-center justify-center rounded-md border-2 p-1 text-3xl font-bold",
              theme === "system" && "border-primary",
            )}
          >
            ?
          </div>
          <span className="block w-full p-2 text-center font-normal">Auto</span>
        </button>
      </CardContent>
    </Card>
  );
};
