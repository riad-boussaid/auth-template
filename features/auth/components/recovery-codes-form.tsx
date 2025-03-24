"use client";

import { ChevronRightIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RecoveryCodesForm = ({
  recoveryCode,
}: {
  recoveryCode: string;
}) => {
  // const codeRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const [text, setText] = useState("Copy");

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Recovery Codes</CardTitle>
        <CardDescription>
          Keep your recovery codes as safe as your password. We recommend saving
          them with a password manager.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{recoveryCode}</p>
      </CardContent>
      <CardFooter className="justify-end gap-x-2">
        <Button
          variant={"secondary"}
          onClick={() => {
            navigator.clipboard.writeText(recoveryCode);
            setText("Copied");
            setTimeout(() => setText("Copy"), 1000);
          }}
        >
          <CopyIcon />
          {text}
        </Button>

        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          Continue
          <ChevronRightIcon />
        </Button>
      </CardFooter>
    </Card>
  );
};
