"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { twoFactorVerificationSchema } from "../validators";
import { useTwoFactorVerification } from "../api/use-two-factor-verification";
import { useRouter } from "next/navigation";

export const TwoFactorVerificationForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof twoFactorVerificationSchema>>({
    resolver: zodResolver(twoFactorVerificationSchema),
    defaultValues: { code: "" },
  });

  const { mutate, isPending } = useTwoFactorVerification();

  const onSubmit = (values: z.infer<typeof twoFactorVerificationSchema>) => {
    mutate({ form: values });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Two-factor Verification</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-6"
          >
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter yoy code"
                      autoComplete="one-time-code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant={"secondary"}
                onClick={() => router.push("/2fa/reset")}
              >
                Reset
              </Button>

              <Button disabled={isPending}>
                {isPending && <Loader className="size-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
