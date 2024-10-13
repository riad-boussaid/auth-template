"use client";

import { ColumnDef } from "@tanstack/react-table";

import { User } from "@/lib/db/schema";
import Image from "next/image";
import { DashboardTableActions } from "./dashboard-table-actions";

export const DashboardTablecolumns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "Profile",
    cell: ({ row }) => (
      <Image
        src={row.original.avatar || ""}
        alt=""
        height={30}
        width={30}
        className="rounded-full"
      />
    ),
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
