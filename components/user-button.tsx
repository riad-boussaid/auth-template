"use client";

import { useState } from "react";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { type User } from "@/lib/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

import { ConfirmDialog } from "@/components/confirm-dialog";

import { useLogout } from "@/features/auth/api/use-logout";

export const UserButton = ({ user }: { user: User | null }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useLogout();

  if (!user) return null;

  const avatarFallback = user?.username?.charAt(0).toUpperCase();

  const logout = () => {
    mutate({});
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar className="">
          <AvatarImage src={user?.avatar || ""} className="" />
          <AvatarFallback className="bg-gradient-to-tr from-primary/75 to-primary/50">
            <p className="text-xl font-bold text-primary-foreground">
              {avatarFallback}
            </p>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[300px] rounded-xl p-0"
      >
        <div className="flex items-start gap-x-4 p-4">
          <Avatar className="">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback className="bg-gradient-to-tr from-primary/75 to-primary/50">
              <p className="text-xl font-bold text-primary-foreground">
                {avatarFallback}
              </p>
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0">
            <p className="text-sm">{user?.username}</p>
            <p className="text-sm">{user?.email}</p>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <DropdownMenuItem
            className="cursor-pointer gap-x-4 rounded-none px-8 py-4"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="cursor-pointer gap-x-4 rounded-none px-8 py-4"
          onClick={() => router.push("/settings?tab=account")}
        >
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator className="m-0 bg-muted" /> */}

        <ConfirmDialog
          open={open}
          title="Confirm logout"
          description="are you sure you want to logout?"
          action="Logout"
          disabled={isPending}
          onConfirm={() => logout()}
          onCancel={() => setOpen(false)}
        />

        <Button
          onClick={() => setOpen(true)}
          className="bg h-12 w-full justify-start gap-x-4 rounded-none bg-background px-8 py-4 text-sm text-foreground outline-none hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
