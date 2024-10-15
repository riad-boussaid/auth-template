"use client";

// import { useRouter } from "next/navigation";
import Link from "next/link";

import { useSession } from "@/components/providers/session-provider";
import { UserButton } from "@/components/user-button";
import { SigninButton } from "@/components/signin-button";

import { cn } from "@/lib/utils";

import { useScrollPosition } from "@/hooks/use-scroll-position";

export const MainHeader = () => {
  const scrollPosition = useScrollPosition();

  // const router = useRouter();
  //   const { theme } = useTheme();

  const { user } = useSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-[80px] w-full bg-background py-4 transition-shadow ",
        scrollPosition > 0
          ? "border-b dark:border-b"
          : "border-none dark:border-none"
      )}
    >
      <div className="container  flex items-center justify-between gap-4  ">
        <div className="size-full">
          <Link href={"/"}>
            <h3 className="font-bold text-2xl">next-lucia-template</h3>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!user ? <SigninButton /> : <UserButton user={user} />}
        </div>
      </div>
    </header>
  );
};
