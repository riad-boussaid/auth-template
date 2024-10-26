"use client";

import { Monitor } from "lucide-react";
import { formatRelative } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

import { Session } from "@/lib/db/schema";

import { UserSessionsTableActions } from "@/features/user/components/user-sessions-table-actions";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

export const UserSessionsTablecolumns: ColumnDef<Session>[] = [
  {
    header: "Session",
    cell: ({ row }) => {
      const { session: currentSession } = useSession();

      return (
        <div className="flex items-center gap-x-1">
          {/* <span className="size-2 rounded-full bg-green-500" /> */}
          <Monitor
            className={cn(
              "m-4 size-8",
              currentSession?.id === row.original.id && "text-green-600",
            )}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Crated at",
    cell: ({ row }) => {
      const session = row.original;

      return (
        <p className="text-sm text-muted-foreground">
          {formatRelative(session.createdAt, new Date())}
        </p>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires at",
    cell: ({ row }) => {
      const session = row.original;

      return (
        <p className="text-sm text-muted-foreground">
          {formatRelative(session.expiresAt, new Date())}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;

      return (
        <div className="text-right">
          <UserSessionsTableActions sessionId={session.id} />
        </div>
      );
    },
  },
];
