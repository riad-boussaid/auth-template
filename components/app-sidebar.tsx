"use client";

import { ChartArea, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "./user-button";
import { useSession } from "./providers/session-provider";

// Menu items.
const items = [
  // {
  //   title: "Home",
  //   url: "#",
  //   icon: Home,
  // },
  // {
  //   title: "Inbox",
  //   url: "#",
  //   icon: Inbox,
  // },
  // {
  //   title: "Calendar",
  //   url: "#",
  //   icon: Calendar,
  // },
  // {
  //   title: "Search",
  //   url: "#",
  //   icon: Search,
  // },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: Settings,
  // },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: User,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: ChartArea,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <Sidebar variant="sidebar" className="*:bg-background">
      <SidebarHeader className="px-4 py-8">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="">
        {/* <SidebarGroup> */}
        {/* <SidebarGroupLabel>Dashboard</SidebarGroupLabel> */}
        {/* <SidebarGroupContent className=""> */}
        <SidebarMenu className="gap-2 p-2">
          {items.map((item) => {
            const isActive = pathname.toLowerCase() === item.url.toLowerCase();

            return (
              <SidebarMenuItem key={item.title} className="">
                <SidebarMenuButton
                  asChild
                  variant={"default"}
                  className="justify-start rounded-full"
                >
                  <Link
                    href={item.url}
                    className={cn(
                      buttonVariants({
                        variant: isActive ? "default" : "ghost",
                        className: "justify-start",
                      }),
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        {/* </SidebarGroupContent> */}
        {/* </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter className="m-4 flex flex-row items-center gap-x-3 rounded-full border p-2">
        <UserButton user={user} />
        <div>
          <p className="text-xs text-muted-foreground">{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
