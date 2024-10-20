"use client";

import { resendVerificationEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// import { SignUpSchema } from "@/lib/validators";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
// import { useForm } from "react-hook-form";
import { useCountdown } from "usehooks-ts";
// import { z } from "zod";

export const EmailVerificationForm = ({ email }: { email: string }) => {
  const { toast } = useToast();

  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000,
    });

  useEffect(() => {
    if (count === 0) {
      stopCountdown();
      resetCountdown();
    }
  }, [count, resetCountdown, stopCountdown]);

  const onResendVerificationEmail = async () => {
    const res = await resendVerificationEmail(email);
    if (res.error) {
      toast({ variant: "destructive", description: res.error });
    }
    if (res.success) {
      toast({ variant: "success", description: res.success });

      startCountdown();
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>Verify Email</h1>
          <p className="text-sm text-muted-foreground">verify your email</p>
        </div>
      </CardHeader>

      <CardContent>
        <Button
          disabled={count > 0 && count < 60}
          onClick={onResendVerificationEmail}
          variant={"link"}
          className="w-full"
        >
          Resend verification email {count > 0 && count < 60 && `in ${count}s`}
        </Button>
      </CardContent>
    </Card>
  );
};
