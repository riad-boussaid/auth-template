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
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { MoreHorizontal, MoreVertical } from "lucide-react";

export const ConnectedAccountsForm = ({
  accounts,
}: {
  accounts: { provider: string }[];
}) => {
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
                <Button size={"icon"} variant={"ghost"} className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
