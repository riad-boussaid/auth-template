"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Loader } from "lucide-react";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { ForgotPasswordSchema } from "@/features/auth/validators";

import { useForgotPassword } from "@/features/auth/mutations/use-forgot-password";

export const ForgotPasswordForm = () => {
  const { mutate, isPending } = useForgotPassword();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>Reset Password</h1>
          <p className="text-sm text-muted-foreground">{""}</p>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* <FormField
              name="confirmNewPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Button className="w-full" disabled={isPending}>
              {isPending && <Loader className="size-4 animate-spin" />}
              Continue
              <ChevronRight className="size-4" />
            </Button>
          </form>
        </Form>

        <CardFooter className="mt-4 flex-col py-0">
          <div className="flex items-center">
            <span className="text-xs">Back to</span>
            <Button variant="link" className="font-normal" size="sm" asChild>
              <Link href={"/sign-in"}>Sign-in</Link>
            </Button>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
