import { cn } from "@/lib/utils";

export const Separator = () => {
  return (
    <div className={cn("flex items-center py-4")}>
      <hr className="h-px w-full border-none bg-muted-foreground" />
      <span className="px-2 text-xs text-muted-foreground">OR</span>
      <hr className="h-px w-full border-none bg-muted-foreground" />
    </div>
  );
};
