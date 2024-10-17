"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";

import { useForm } from "react-hook-form";
import { useCountdown } from "usehooks-ts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Separator } from "./separator";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Social } from "./social";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { SignInSchema } from "@/lib/validators";
import { resendVerificationEmail, signIn } from "@/actions/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export const SigninForm = () => {
  const router = useRouter();
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

  const [showResendVerificationEmail, setShowResendVerificationEmail] =
    useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    const res = await signIn(values);
    if (res.error) {
      toast({ variant: "destructive", description: res.error });

      if (res?.key === "email_not_verified") {
        setShowResendVerificationEmail(true);
      }
    } else if (res.success) {
      toast({ variant: "default", description: "Signed in successfully" });

      router.push("/");
    }
  }

  const onResendVerificationEmail = async () => {
    const res = await resendVerificationEmail(form.getValues("email"));
    if (res.error) {
      toast({ variant: "destructive", description: res.error });
    } else if (res.success) {
      toast({ variant: "default", description: res.success });

      startCountdown();
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>{"Sign in"}</h1>
          <p className="text-sm text-muted-foreground">{"Welcome back"}</p>
        </div>
      </CardHeader>

      <CardContent>
        {!showResendVerificationEmail && (
          <>
            <div>
              <Social />
            </div>

            <Separator />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={false}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>

            <CardFooter className="mt-4 flex-col py-0">
              <div className="flex items-center">
                <span className="text-xs">Don&apos;t have an account?</span>
                <Button
                  variant="link"
                  className="font-normal"
                  size="sm"
                  asChild
                >
                  <Link href={"/register"}>Register</Link>
                </Button>
              </div>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                By clicking continue, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </CardFooter>
          </>
        )}

        {showResendVerificationEmail && (
          <Button
            disabled={count > 0 && count < 60}
            onClick={onResendVerificationEmail}
            variant={"link"}
          >
            Send verification email {count > 0 && count < 60 && `in ${count}s`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
