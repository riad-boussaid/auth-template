"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { updatePasswordAction } from "@/actions/user-action";
// import { User } from "@/lib/db/schema";

export const PasswordForm = () => {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
  };

  const passwordSchema = z.object({
    password: z
      .string()
      .min(1, { message: "Password must be at least 8 characters long" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (isEditing) {
      updatePasswordAction(values)
        .then((data) => {
          if (data?.success)
            toast({ variant: "default", description: data.success });
          if (data?.error)
            toast({ variant: "destructive", description: data.error });
        })
        .catch(() => toast({ variant: "destructive", description: "error" }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card x-chunk="dashboard-04-chunk-1">
          <CardHeader>
            <CardTitle>Password Settings</CardTitle>
            <CardDescription>Change your security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={!isEditing}
                      placeholder="***"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={!isEditing}
                      placeholder="***"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4 gap-x-2 justify-end">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => toggleEditMode()}
            >
              {!isEditing ? "Edit" : "Cancel"}
            </Button>
            <Button disabled={!isEditing}>Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
