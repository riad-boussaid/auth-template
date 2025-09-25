"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";

export const UpdateTwoFactorVerification = () => {
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
