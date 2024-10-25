"use client";

import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/hooks/use-toast";

import { roleEnums } from "@/lib/db/schema";
import { useUpdateRole } from "../api/use-update-role";

export const UpdateRoleForm = ({
  userId,
  role,
}: {
  userId: string;
  role: (typeof roleEnums.enumValues)[number];
}) => {
  const { toast } = useToast();
  const { user } = useSession();

  const { mutate } = useUpdateRole();

  const onValueChange = (newRole: string) => {
    mutate({ form: { userId, role: newRole } });
  };

  return (
    <Select
      defaultValue={role}
      onValueChange={(newRole) => onValueChange(newRole)}
    >
      <SelectTrigger
        disabled={user?.id === userId}
        className="w-[120px] rounded-full"
      >
        <SelectValue placeholder={"Role"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={"ADMIN"}>ADMIN</SelectItem>
        <SelectItem value={"USER"}>USER</SelectItem>
      </SelectContent>
    </Select>
  );
};
