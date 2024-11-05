"use client";

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

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { twoFactorSchema } from "../validators";
import { useTwoFactorVerification } from "../api/use-two-factor-verification";

export const TwoFactorVerificationForm = () => {
  const form = useForm<z.infer<typeof twoFactorSchema>>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  });

  const { mutate, isPending } = useTwoFactorVerification();

  const onSubmit = (values: z.infer<typeof twoFactorSchema>) => {
    mutate({ form: values });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app.
        </CardDescription>
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
            <Button disabled={isPending}>
              {isPending && <Loader className="size-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
