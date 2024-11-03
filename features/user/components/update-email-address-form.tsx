"use client";

import {
  Ban,
  Edit,
  MoreHorizontal,
  Plus,
  PlusCircle,
  Save,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useSession } from "@/components/providers/session-provider";

import { updateEmailSchema } from "../validators";
import { useUpdateEmail } from "../api/use-update-email";
import { useState } from "react";

export const UpdateEmailAddressForm = () => {
  const { user } = useSession();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing((current) => !current);
    form.reset();
  };

  const form = useForm<z.infer<typeof updateEmailSchema>>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  const { mutate: updateEmail, isPending: isUpdating } = useUpdateEmail();

  const onSubmit = (values: z.infer<typeof updateEmailSchema>) => {
    updateEmail({ form: values });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>update your email address</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <Input
                    disabled={!isEditing}
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="justify-end gap-x-2">
            <Button variant={"outline"} type="button" onClick={toggleEditMode}>
              {isEditing ? (
                <>
                  <Ban className="size-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="size-4" />
                  Edit
                </>
              )}
            </Button>
            <Button
              disabled={!isEditing}
              type="submit"
              className="rounded-full"
            >
              <Save className="size-4" />
              Save
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
