"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import { Loader, RefreshCw, Trash } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";

export const UpdateAvatarForm = ({ imageUrl }: { imageUrl: string | null }) => {
  const { toast } = useToast();
  const router = useRouter();

  const [image, setImage] = useState<string | null>(imageUrl);
  const [open, setOpen] = useState(false);

  const inputElementRef = useRef<HTMLInputElement>(null);

  const onDelete = async () => {
    const response = await deleteAvatarAction();
    if (response.error) {
      toast({ variant: "destructive", description: response.error });
    }
    if (response.success) {
      toast({ variant: "success", description: response.success });
    }

    setImage(null);
    setOpen(false);
    router.refresh();
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

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const readURL = (file: Blob) => {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
      });
    };

    const file = event.target.files?.[0];

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
        {!image ? (
          <form>
            <Input type="file" accept="image/*" onChange={handleChange} />
          </form>
        ) : (
          <div className="relative size-fit">
            <Avatar className="size-40">
              <AvatarImage src={image} />
              <AvatarFallback className="animate-pulse">
                {/* <Loader className="size-4 animate-spin" /> */}
              </AvatarFallback>
            </Avatar>

            <div className="absolute bottom-0 right-0 flex items-start gap-x-1">
              <input
                hidden
                ref={inputElementRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
              />

              <Button
                size={"icon"}
                className="rounded-full"
                onClick={() => inputElementRef.current?.click()}
              >
                <RefreshCw className="size-4" />
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

              <Button
                variant={"destructive"}
                size={"icon"}
                className="rounded-full"
                onClick={() => setOpen(true)}
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
