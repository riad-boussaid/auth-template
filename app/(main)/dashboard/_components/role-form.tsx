import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/hooks/use-toast";
import { updateRoleAction } from "@/actions/user-action";

import { roleEnums } from "@/lib/db/schema";
import React from "react";

export const RoleForm = ({
  userId,
  role,
}: {
  userId: string;
  role: (typeof roleEnums.enumValues)[number];
}) => {
  const { toast } = useToast();
  const { user } = useSession();

  const onValueChange = (newRole: string) => {
    updateRoleAction(userId, newRole).then((data) => {
      if (data?.error) {
        toast({ variant: "destructive", description: data.error });
      }
      if (data?.success) {
        toast({ variant: "default", description: data.success });
      }
    });
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
