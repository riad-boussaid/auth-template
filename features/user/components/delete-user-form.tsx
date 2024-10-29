"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  //   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useSession } from "@/components/providers/session-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";

// import { useToast } from "@/hooks/use-toast";

import { useDeleteUser } from "@/features/user/api/use-delete-user";

export const DeleteUserForm = () => {
  // const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useDeleteUser();
  const { user } = useSession();

  if (!user) {
    return null;
  }

  const deleteAccount = () => {
    mutate({});
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Once you delete your account, there is no going back. Please be
          certain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ConfirmDialog
          open={open}
          title="Confirm Deletion"
          description="Once you delete your account, there is no going back. Please be
          certain>"
          action="Delete"
          disabled={isPending}
          onConfirm={() => deleteAccount()}
          onCancel={() => setOpen(false)}
        />
        <Button
          variant={"destructive"}
          onClick={() => setOpen(true)}
          className=""
        >
          Delete your account
        </Button>
      </CardContent>
    </Card>
  );
};
