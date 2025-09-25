"use client";

import { useRef, useState } from "react";
import { Loader, Trash, Upload } from "lucide-react";

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

import { cn } from "@/lib/utils";

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

  const { mutate: updateAvatar, isPending: isUpdating } = useUpdateAvatar();
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const onUpdate = async (avatar: string) => {
    updateAvatar(
      { form: { avatar } },
      {
        onSuccess() {
          window.location.reload();
        },
        onError() {
          window.location.reload();
          // router.refresh();
        },
      },
    );
  };

  const onDelete = async () => {
    deleteAvatar(
      {},
      {
        onSuccess() {
          setImage(null);
          setOpen(false);
          window.location.reload();
        },
      },
    );
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
      <CardContent className="flex items-center gap-x-3">
        <Avatar className={cn("size-40", isUpdating && "animate-pulse")}>
          {image && <AvatarImage src={image} />}
          <AvatarFallback className="from-primary/75 to-primary/50 bg-linear-to-tr">
            <p className="text-primary-foreground text-[75px] font-bold">
              {username?.charAt(0).toUpperCase()}
            </p>
          </AvatarFallback>
        </Avatar>

        <input
          hidden
          ref={inputElementRef}
          type="file"
          accept="image/jpeg, .png, .ico, .svg"
          onChange={handleChange}
        />

        <ConfirmDialog
          open={open}
          title="Delete Profile Picture"
          description="Are you sure you want to delete your profile picture?"
          action="Delete"
          disabled={isDeleting}
          onCancel={() => setOpen(false)}
          onConfirm={async () => await onDelete()}
        />

        <div>
          <div className="flex items-center gap-x-2">
            <Button
              disabled={isUpdating}
              variant={"secondary"}
              size={"sm"}
              className="rounded-full"
              onClick={() => inputElementRef.current?.click()}
            >
              {isUpdating ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 font-bold" />
                  Uplaod
                </>
              )}
            </Button>

            {image !== null && (
              <Button
                disabled={isDeleting || isUpdating}
                variant={"destructive"}
                size={"sm"}
                className="rounded-full"
                onClick={() => setOpen(true)}
              >
                <Trash className="size-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Accepted formats .jpg .jpeg .png .ico .svg
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Recommended size 1:1, up to 2MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
