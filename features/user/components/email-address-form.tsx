"use client";

import { MoreHorizontal, PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { useSession } from "@/components/providers/session-provider";

export const EmailAddressForm = () => {
  const { user } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Adressess</CardTitle>
        <CardDescription>Your email addressess</CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          <li className="flex w-fit items-center gap-x-2 rounded-full border py-2 pl-4 pr-2">
            <p className="text-sm">{user?.email}</p>
            <Badge variant={"default"} className="rounded-full">
              primary
            </Badge>
            <Button size={"icon"} variant={"ghost"}>
              <MoreHorizontal className="size-4" />
            </Button>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="justify-end">
        <Button size={"sm"} className="rounded-full">
          <PlusCircle className="size-4" />
          Add email
        </Button>
      </CardFooter>
    </Card>
  );
};
