import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export const NotificationPopover = () => {
  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="size-10 rounded-full"
        >
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        sideOffset={10}
        align="end"
        className="rounded-xl"
      >
        <div className="flex flex-col items-center justify-center gap-6">
          <Bell className="size-28" />
          <p className="text-sm text-muted-foreground">Notifications</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
