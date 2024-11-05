"use client";

import { Ban, Edit, Save } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
import Link from "next/link";

export const UpdateTwoFactorVerification = () => {
  const { user } = useSession();

  // const [isEditing, setIsEditing] = useState(false);
  // const router = useRouter();

  // const toggleEditMode = () => {
  //   setIsEditing((current) => !current);
  //   form.reset();
  // };

  // const form = useForm<z.infer<typeof updateUsernameSchema>>({
  //   resolver: zodResolver(updateUsernameSchema),
  //   defaultValues: {
  //     username: user?.username || "",
  //   },
  // });

  // const { mutateAsync, isPending } = useUpdateUsername();

  // const onSubmit = async (values: z.infer<typeof updateUsernameSchema>) => {
  //   await mutateAsync({ form: values });
  //   toggleEditMode();
  //   // router.refresh();
  //   window.location.reload();
  // };

  return (
    // <Form {...form}>
    // <form onSubmit={form.handleSubmit(onSubmit)}>
    <Card>
      <CardHeader>
        <CardTitle>2FA</CardTitle>
        <CardDescription>Update 2FA</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={"/2fa/setup"}>Update 2FA</Link>
        </Button>
      </CardContent>
      <CardFooter className="justify-end gap-x-2 px-6"></CardFooter>
    </Card>
    // </form>
    // </Form>
  );
};
