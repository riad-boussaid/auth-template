"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
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

import { useSession } from "@/components/providers/session-provider";

import { useUpdateUsername } from "@/features/user/api/use-update-username";
import { useRouter } from "next/navigation";

export const UpdateUsernameForm = () => {
  const { user } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
    form.reset();
  };

  const usernameSchema = z.object({
    username: z.string().min(1),
  });

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user?.username || "",
    },
  });

  const { mutateAsync, isPending } = useUpdateUsername();

  const onSubmit = async (values: z.infer<typeof usernameSchema>) => {
    await mutateAsync({ json: values });
    toggleEditMode();
    // router.refresh();
    window.location.reload();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Full name</CardTitle>
            <CardDescription>Change your name.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="name"
                      disabled={!isEditing}
                      placeholder="your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-x-2 border-t px-6 py-4">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => toggleEditMode()}
            >
              {!isEditing ? "Edit" : "Cancel"}
            </Button>
            <Button disabled={!isEditing || isPending}>Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
