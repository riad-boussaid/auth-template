"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ErrorCard = () => {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>Error</h1>
          <p className="text-muted-foreground text-sm">
            Oops! Something went wrong!
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ShieldAlert className="text-destructive mx-auto" />
      </CardContent>
      <CardFooter>
        <Button variant={"link"} size={"sm"} className="w-full" asChild>
          <Link href={"/sign-in"}>Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
