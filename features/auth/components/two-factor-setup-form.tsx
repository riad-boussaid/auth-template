"use client";

import { encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI } from "@oslojs/otp";
import { renderSVG } from "uqr";

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
import { Loader } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/components/providers/session-provider";
import { twoFactorSetupSchema } from "../validators";
import { useTwoFactorVerificationSetup } from "../api/use-two-factor-verification-setup";

export const TwoFactorSetupForm = ({
  encodedTOTPKey,
  qrcode,
}: {
  encodedTOTPKey: string;
  qrcode: string;
}) => {
  //   const { user } = useSession();

  const form = useForm<z.infer<typeof twoFactorSetupSchema>>({
    resolver: zodResolver(twoFactorSetupSchema),
    defaultValues: {
      encodedKey: encodedTOTPKey,
      code: "",
    },
  });

  const { mutateAsync, isPending } = useTwoFactorVerificationSetup();

  const onSubmit = async (values: z.infer<typeof twoFactorSetupSchema>) => {
    await mutateAsync({ form: values });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Set up two-factor authentication</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <div
        className="mx-auto mb-6 h-[200px] w-[200px]"
        dangerouslySetInnerHTML={{
          __html: qrcode,
        }}
      ></div>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-4"
          >
            <FormField
              name="encodedKey"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      hidden
                      // placeholder="Enter yoy code"
                      // autoComplete="one-time-code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
