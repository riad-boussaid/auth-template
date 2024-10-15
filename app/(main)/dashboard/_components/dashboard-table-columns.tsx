"use client";

import { ColumnDef } from "@tanstack/react-table";

import { User } from "@/lib/db/schema";
// import Image from "next/image";
import { DashboardTableActions } from "./dashboard-table-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DashboardTablecolumns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "Profile",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar>
          <AvatarImage src={user?.avatar || ""} />
          <AvatarFallback className="bg-gradient-to-tr from-primary/75 to-primary/50   ">
            <p className="font-bold text-primary-foreground text-xl">
              {user?.username?.charAt(0).toUpperCase()}
            </p>
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "emailVerified",
    header: "emailVerified",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="text-right">
          <DashboardTableActions user={user} />
        </div>
      );
    },
  },
];
