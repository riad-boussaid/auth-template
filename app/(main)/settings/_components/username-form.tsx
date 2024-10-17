"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
// import { User } from "@/lib/db/schema";
import { useSession } from "@/components/providers/session-provider";
import { useState } from "react";
import { updateUsernameAction } from "@/actions/user-action";
// import { cn } from "@/lib/utils";

export const UsernameForm = () => {
  const { toast } = useToast();
  const { user } = useSession();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
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

  const onSubmit = async (values: z.infer<typeof usernameSchema>) => {
    if (isEditing && values.username !== user?.username) {
      updateUsernameAction(values.username)
        .then((data) => {
          if (data?.success)
            toast({ variant: "default", description: data.success });
        })
        .catch(() => toast({ variant: "destructive", description: "error" }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card x-chunk="dashboard-04-chunk-1">
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
            <Button disabled={!isEditing}>Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
