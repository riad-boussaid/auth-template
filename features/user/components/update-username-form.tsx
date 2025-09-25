"use client";

import { Ban, Edit, Save } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { updateUsernameSchema } from "@/features/user/validators";

export const UpdateUsernameForm = () => {
  const { user } = useSession();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
    form.reset();
  };

  const form = useForm<z.infer<typeof updateUsernameSchema>>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: {
      username: user?.username || "",
    },
  });

  const { mutateAsync, isPending } = useUpdateUsername();

  const onSubmit = async (values: z.infer<typeof updateUsernameSchema>) => {
    await mutateAsync({ form: values });
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
                      className="rounded-full"
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
          <CardFooter className="justify-end gap-x-2 px-6">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => toggleEditMode()}
            >
              {!isEditing ? (
                <>
                  <Edit className="size-4" />
                  Edit
                </>
              ) : (
                <>
                  <Ban className="size-4" />
                  Cancel
                </>
              )}
            </Button>
            <Button disabled={!isEditing || isPending}>
              <Save className="size-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
