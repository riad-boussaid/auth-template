"use client";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useEmailVerification } from "@/features/auth/api/use-email-verification";
import { useResendEmailVerification } from "@/features/auth/api/use-resend-email-verification";

import { useCountdown } from "@/hooks/use-countdown";

export const EmailVerificationForm = () => {
  // const { toast } = useToast();

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

  const codeSchema = z.object({
    code: z.string().min(6),
  });

  const form = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const { mutate, isPending } = useEmailVerification();
  const { mutateAsync: mutateAsyncResend } = useResendEmailVerification();

  const onSubmit = async (values: z.infer<typeof codeSchema>) => {
    mutate({ form: values });
  };

  const onResendVerificationEmail = async () => {
    await mutateAsyncResend({});

    startCountdown();
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>Verify your email</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-4"
          >
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter yoy code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending}>
              {isPending && <Loader className="size-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          disabled={count > 0 && count < 60}
          onClick={onResendVerificationEmail}
          variant={"link"}
          className="w-full"
        >
          Resend verification email {count > 0 && count < 60 && `in ${count}s`}
        </Button>
      </CardFooter>
    </Card>
  );
};
