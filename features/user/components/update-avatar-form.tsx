"use client";

import { useRef, useState } from "react";
import { RefreshCw, Trash } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { useUpdateAvatar } from "../api/use-update-avatar";
import { useDeleteAvatar } from "../api/use-delete-avatar";

export const UpdateAvatarForm = ({
  imageUrl,
  username,
}: {
  imageUrl: string | null;
  username: string | null;
}) => {
  const [image, setImage] = useState<string | null>(imageUrl);
  const [open, setOpen] = useState(false);

  const inputElementRef = useRef<HTMLInputElement>(null);

  const { mutate } = useUpdateAvatar();
  const { mutateAsync } = useDeleteAvatar();

  const onUpdate = async (avatar: string) => {
    mutate({ form: { avatar } });
  };

  const onDelete = async () => {
    await mutateAsync({});

    setImage(null);
    setOpen(false);
  };

  const handleChange = async () => {
    const readURL = (file: Blob) => {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
      });
    };

    // const file = event.target.files?.[0];
    const file = inputElementRef.current?.files?.[0];

    if (file) {
      const url = await readURL(file);
      setImage(url as string);

      if (url) await onUpdate(url as string);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>change your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="group relative size-fit">
          <Avatar className="size-48">
            <AvatarImage src={image || ""} />
            <AvatarFallback className="bg-gradient-to-tr from-primary/75 to-primary/50">
              <p className="text-[75px] font-bold text-primary-foreground">
                {username?.charAt(0).toUpperCase()}
              </p>
            </AvatarFallback>
          </Avatar>

          <div className="absolute bottom-0 right-0 flex size-full items-center justify-center gap-x-1 rounded-full opacity-0 transition-all group-hover:bg-black/80 group-hover:opacity-100">
            <input
              hidden
              ref={inputElementRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
            />

            <Button
              variant={"secondary"}
              className="size-14 rounded-full"
              onClick={() => inputElementRef.current?.click()}
            >
              <RefreshCw className="size-8 font-bold" />
            </Button>

            <ConfirmDialog
              open={open}
              title="Delete Profile Picture"
              description="Are you sure you want to delete your profile picture?"
              action="Delete"
              disabled={false}
              onCancel={() => setOpen(false)}
              onConfirm={async () => await onDelete()}
            />

            {image !== null && (
              <Button
                variant={"destructive"}
                className="size-14 rounded-full"
                onClick={() => setOpen(true)}
              >
                <Trash className="size-8" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
