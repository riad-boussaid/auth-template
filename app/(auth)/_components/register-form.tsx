"use client";

import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

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
// import { useRouter } from "next/navigation";
import { useCountdown } from "usehooks-ts";
import { useEffect, useState } from "react";
import { SignUpSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { resendVerificationEmail, signUp } from "@/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Social } from "./social";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

export const RegisterForm = () => {
  // const router = useRouter();
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

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    const res = await signUp(values);
    startCountdown();
    if (res.error) {
      toast({ variant: "destructive", description: res.error });
    } else if (res.success) {
      toast({
        variant: "default",
        description:
          "We've sent an verification email to your inbox. Please verify your email to continue.",
      });
      setShowResendVerificationEmail(true);
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
          <h1 className={"text-3xl font-semibold"}>{"Register"}</h1>
          <p className="text-sm text-muted-foreground">{""}</p>
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
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="username"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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

                <Button className="w-full" disabled={false}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>

            <CardFooter className="mt-4 py-0 flex-col">
              <div className="flex items-center">
                <span className="text-xs"> Already have an account?</span>
                <Button
                  variant="link"
                  className=" font-normal"
                  size="sm"
                  asChild
                >
                  <Link href={"/sign-in"}>Sign-in</Link>
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
            className="w-full"
          >
            Send verification email {count > 0 && count < 60 && `in ${count}s`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
