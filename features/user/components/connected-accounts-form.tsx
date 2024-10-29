"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAccount } from "../api/use-delete-account";
import { useRouter } from "next/navigation";

export const ConnectedAccountsForm = ({
  accounts,
}: {
  accounts: { id: string; provider: string }[];
}) => {
  const router = useRouter();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const onDelete = (accountId: string) => {
    deleteAccount(
      { form: { accountId } },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>List of your Accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex items-center gap-x-2">
          {accounts.map((account) => {
            return (
              <li
                key={account.provider}
                className="flex w-fit items-center gap-x-2 rounded-full border py-2 pl-4 pr-2"
              >
                {account.provider === "google" && (
                  <FcGoogle className="size-4" />
                )}
                {account.provider === "facebook" && (
                  <FaFacebook className="size-4" />
                )}
                <p className="text-sm">{account.provider}</p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size={"icon"} variant={"ghost"} className="size-7">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="bottom" className="">
                    <DropdownMenuItem onClick={() => onDelete(account.id)}>
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
