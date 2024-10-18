"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const ErrorCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oops! Something went wrong!</CardTitle>
      </CardHeader>
      <CardContent>
        <ShieldAlert className="text-destructive" />
      </CardContent>
      <CardFooter>
        <Link href={"/sign-in"}>Back to sign in</Link>
      </CardFooter>
    </Card>
  );
};
