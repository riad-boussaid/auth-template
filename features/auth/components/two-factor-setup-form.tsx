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

export const TwoFactorSetupForm = ({
  encodedTOTPKey,
  qrcode,
}: {
  encodedTOTPKey: string;
  qrcode: string;
}) => {
  //   const { user } = useSession();

  const twoFactorAuthenticationSetupCodeSchema = z.object({
    code: z.string().min(6),
  });

  const form = useForm<z.infer<typeof twoFactorAuthenticationSetupCodeSchema>>({
    resolver: zodResolver(twoFactorAuthenticationSetupCodeSchema),
    defaultValues: { code: "" },
  });

  const isPending = false;

  const onSubmit = () => {};

  //   const totpKey = new Uint8Array(20);
  //   crypto.getRandomValues(totpKey);
  //   const encodedTOTPKey = encodeBase64(totpKey);
  //   const keyURI = createTOTPKeyURI("Demo", user?.username!, totpKey, 30, 6);
  //   const qrcode = renderSVG(keyURI);

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
