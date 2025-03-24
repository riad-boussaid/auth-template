"use client";

import { Loader } from "lucide-react";

import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  //   AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { buttonVariants } from "@/components/ui/button";

export const ConfirmDialog = ({
  open,
  title,
  description,
  action,
  disabled,
  onConfirm,
  onCancel,
  //   children,
}: {
  open: boolean;
  title: string;
  description: string;
  action: string;
  disabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  //   children: React.ReactNode;
}) => {
  return (
    <AlertDialog open={open}>
      {/* <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled}
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            {disabled && <Loader className="size-4 animate-spin" />}
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
