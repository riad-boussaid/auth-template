"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export const SigninButton = () => {
  const router = useRouter();
  return (
    <Button
      variant={"default"}
      size="default"
      className="rounded-full"
      onClick={() => router.push("/sign-in")}
    >
      <LogIn className="size-4" />
      Login
    </Button>
  );
};
