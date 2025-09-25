"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { twoFactorResetSchema } from "../validators";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { LoaderIcon } from "lucide-react";
import { useTwoFactorVerificationReset } from "../api/use-two-factor-verification-reset";

export const TwoFactorResetForm = () => {
  const form = useForm<z.infer<typeof twoFactorResetSchema>>({
    resolver: zodResolver(twoFactorResetSchema),
    defaultValues: { backupCode: "" },
  });

  const { mutateAsync, isPending } = useTwoFactorVerificationReset();

  const onSubmit = async (values: z.infer<typeof twoFactorResetSchema>) => {
    await mutateAsync({ form: values });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Recovery Your Account</CardTitle>
        <CardDescription>Enter your recovery code.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="backupCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recovery Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your recovery code" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button disabled={isPending} type="submit" className="w-full">
              {isPending && <LoaderIcon className="size-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
