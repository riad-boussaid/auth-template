"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { User } from "@/lib/db/schema";

import { UsersTableActions } from "@/features/user/components/users-table-actions";
import { UpdateRoleForm } from "@/features/user/components/update-role-form";

export const UsersTablecolumns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "Profile",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar>
          <AvatarImage src={user?.avatar || ""} />
          <AvatarFallback className="bg-linear-to-tr from-primary/75 to-primary/50">
            <p className="text-xl font-bold text-primary-foreground">
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
    cell: ({ row }) => {
      const userId = row.original.id;
      const role = row.original.role;

      return <UpdateRoleForm userId={userId} role={role} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="text-right">
          <UsersTableActions user={user} />
        </div>
      );
    },
  },
];
