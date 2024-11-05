"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useRef, useState } from "react";

export const RecoveryCodesForm = ({
  recoveryCode,
}: {
  recoveryCode: string;
}) => {
  const codeRef = useRef<HTMLParagraphElement>(null);
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
      <CardFooter className="justify-end">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(recoveryCode);
            setText("Copied");
            setTimeout(() => setText("Copy"), 1000);
          }}
        >
          <Copy className="size-4" />
          {text}
        </Button>
      </CardFooter>
    </Card>
  );
};
