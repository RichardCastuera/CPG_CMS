"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Archive,
  BookMarked,
  Users,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Guidelines", url: "/guidelines", icon: BookOpen },
  { title: "Reviews", url: "/reviews", icon: ClipboardCheck },
  { title: "Artifacts", url: "/artifacts", icon: Archive },
  { title: "References", url: "/references", icon: BookMarked },
  { title: "Users", url: "/users", icon: Users },
  { title: "Audit Log", url: "/logs", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/CPG_logo.png"
            alt="CPG-CMS Logo"
            width={44}
            height={44}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h2 className="text-base font-bold leading-none">CPG-CMS</h2>
              <span className="flex bg-[#2F6B4F]/15 rounded-full px-2 py-1 ml-1 border border-[#2F6B4F]/40">
                <span className="text-[10px] font-semibold text-[#2F6B4F]">
                  ADMIN
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clinical Practice Guideline
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.url === "/dashboard"
                    ? pathname === item.url
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="p-0"
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2",
                          isActive
                            ? "!bg-[#2F6B4F] !text-white hover:!bg-[#2F6B4F] hover:!text-white [&_svg]:!text-white"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <item.icon className="size-4" />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#2F6B4F]/15 text-sm font-medium text-[#2F6B4F]">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium leading-tight">
                Admin@gmail.com
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Log out"
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors",
            )}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
