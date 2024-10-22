"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Social } from "@/features/auth/components/social";

import { SignInSchema } from "@/features/auth/validators";

import { useLogin } from "@/features/auth/mutations/use-login";

export const SigninForm = () => {
  const router = useRouter();
  // const { toast } = useToast();

  const { mutate, isPending } = useLogin();
  // const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    mutate({ json: values });
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>{"Sign in"}</h1>
          <p className="text-sm text-muted-foreground">{"Welcome back"}</p>
        </div>
      </CardHeader>

      <CardContent >
        <div>
          <Social />
        </div>

        <Separator />

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
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                  <Button
                    type="button"
                    variant={"link"}
                    size={"sm"}
                    className="p-0"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forget password
                  </Button>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader className="size-4 animate-spin" />}
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </Form>

        <CardFooter className="mt-4 flex-col py-0">
          <div className="flex items-center">
            <span className="text-xs">Don&apos;t have an account?</span>
            <Button variant="link" className="font-normal" size="sm" asChild>
              <Link href={"/register"}>Register</Link>
            </Button>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
