"use client";

import { LayoutDashboard, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/actions/auth";
import { User } from "lucia";
import { useRouter } from "next/navigation";

export const UserButton = ({ user }: { user: User | null }) => {
  const router = useRouter();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full">
        <Avatar>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-gradient-to-tr from-primary/75 to-primary/75 text-primary-foreground">
            {/* {`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(
              0
            )}`} */}
            {user?.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[300px] rounded-xl border-none bg-secondary p-0"
      >
        <div className="flex items-start gap-x-4 p-4">
          <Avatar className="">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-secondary">
              {/* {`${user?.firstName?.charAt(0)}${user?.lastName?.charAt(
                0
              )}`} */}
              {user?.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0">
            <p className="text-sm">{user?.username}</p>
            <p className="text-sm">{user?.email}</p>
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <DropdownMenuItem
            className="cursor-pointer gap-x-4 rounded-none px-8 py-4 focus:bg-background/50 focus:text-foreground"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="cursor-pointer gap-x-4 rounded-none px-8 py-4 focus:bg-background/50 focus:text-foreground"
          onClick={() => router.push("/settings")}
        >
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>

        {/* <DropdownMenuSeparator className="bg-foreground/25" /> */}

        <DropdownMenuItem
          className="cursor-pointer gap-x-4 rounded-none px-8 py-4 focus:bg-destructive focus:text-destructive-foreground"
          onClick={async () => await signOut()}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
