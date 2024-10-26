"use client";

import { ArrowRight, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Separator } from "@/features/auth/components/separator";
import { Social } from "@/features/auth/components/social";

import { SignUpSchema } from "@/features/auth/validators";

import { useRegister } from "@/features/auth/api/use-register";

export const RegisterForm = () => {
  // const router = useRouter();
  // const { toast } = useToast();
  const { mutate, isPending } = useRegister();

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
    mutate({ json: values });
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>{"Register"}</h1>
          <p className="text-sm text-muted-foreground">{""}</p>
        </div>
      </CardHeader>

      <CardContent>
        <>
          <div>
            <Social />
          </div>

          <Separator />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="••••"
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
                        placeholder="••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" disabled={isPending}>
                {isPending && <Loader className="size-4 animate-spin" />}
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Form>

          <CardFooter className="mt-4 flex-col py-0">
            <div className="flex items-center">
              <span className="text-xs"> Already have an account?</span>
              <Button variant="link" className="font-normal" size="sm" asChild>
                <Link href={"/sign-in"}>Sign-in</Link>
              </Button>
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </CardFooter>
        </>
      </CardContent>
    </Card>
  );
};
