"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ConfirmDialog } from "@/components/confirm-dialog";

import { useDeleteSession } from "../api/use-delete-session";

export const UserSessionsTableActions = ({
  sessionId,
}: {
  sessionId: string;
}) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const onConfirm = () => {
    deleteSession(
      {
        form: { sessionId },
      },
      { onSuccess: () => router.refresh() },
    );
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        title={"Revoke session"}
        description={"You will no longer stay logedin, are you sure?"}
        action={"Revoke"}
        disabled={false}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />

      <Button
        variant={"destructive"}
        size={"sm"}
        className="rounded-full"
        disabled={false}
        onClick={() => setOpen(true)}
      >
        Revoke session
      </Button>
    </>
  );
};
