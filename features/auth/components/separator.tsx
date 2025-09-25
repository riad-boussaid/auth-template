import { cn } from "@/lib/utils";

export const Separator = () => {
  return (
    <div className={cn("flex items-center py-4")}>
      <hr className="bg-muted-foreground h-px w-full border-none" />
      <span className="text-muted-foreground px-2 text-xs">OR</span>
      <hr className="bg-muted-foreground h-px w-full border-none" />
    </div>
  );
};
