"use client";

import {
  Card,
  CardContent,
  CardDescription,
//   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { deleteAccountAction } from "@/actions/user-action";
import { useSession } from "@/components/providers/session-provider";

export const DeleteAccount = () => {
  const { toast } = useToast();
  const { user } = useSession();

  const onClick = (userId: string) => {
    deleteAccountAction(userId)
      .then((data) => {
        if (data?.success)
          toast({ variant: "default", description: data.success });
      })
      .catch(() => toast({ variant: "destructive", description: "error" }));
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Once you delete your account, there is no going back. Please be
          certain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant={"destructive"}
          onClick={() => onClick(user?.id || "")}
          className=""
        >
          Delete your account
        </Button>
      </CardContent>
    </Card>
  );
};
