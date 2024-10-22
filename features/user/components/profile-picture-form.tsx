"use client";

import { RefreshCw, Trash } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

import { deleteAvatarAction, updateAvatarAction } from "@/actions/user-action";

export const ChangeProfilePicture = ({
  imageUrl,
}: {
  imageUrl: string | null;
}) => {
  const { toast } = useToast();

  const onDelete = async () => {
    const response = await deleteAvatarAction();
    if (response.error) {
      toast({ variant: "destructive", description: response.error });
    }
    if (response.success) {
      toast({ variant: "success", description: response.success });
    }
  };

  const onUpdate = async (avatar: string) => {
    const response = await updateAvatarAction(avatar);
    if (response.error) {
      toast({ variant: "destructive", description: response.error });
    }
    if (response.success) {
      toast({ variant: "success", description: response.success });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>change your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        {!imageUrl ? (
          <form>
            <input type="file" />
          </form>
        ) : (
          <div className="relative size-fit">
            <Avatar className="size-40">
              <Image
                src={imageUrl}
                alt="profile picture"
                fill
                className="object-cover"
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 flex items-start gap-x-1">
              <Button
                size={"icon"}
                className="rounded-full"
                onClick={() =>
                  onUpdate(
                    "https://lumiere-a.akamaihd.net/v1/images/a_avatarpandorapedia_neytiri_16x9_1098_01_0e7d844a.jpeg?region=420%2C0%2C1080%2C1080",
                  )
                }
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                variant={"destructive"}
                size={"icon"}
                className="rounded-full"
                onClick={onDelete}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
