"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader, Save, Ban, Edit } from "lucide-react";

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

import { ResetPasswordSchema } from "@/features/user/validators";
import { useResetPassword } from "@/features/user/api/use-update-password";

export const UpdatePasswordForm = () => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
    form.reset();
  };

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { mutateAsync, isPending } = useResetPassword();

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    await mutateAsync({ json: values });
    toggleEditMode();
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <CardHeader className="">
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
                      placeholder="••••"
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
                      placeholder="••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="confirmNewPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={!isEditing}
                      placeholder="••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="ml-auto justify-end gap-x-2 px-6">
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

            <Button type="submit" disabled={!isEditing || isPending}>
              {isPending && <Loader className="size-4 animate-spin" />}
              <Save className="size-4" />
              Save
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
