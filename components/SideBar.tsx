"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Archive,
  BookMarked,
  Users,
  History,
  LogOut,
  ArchiveIcon,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import Branding from "./Branding";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Guidelines", url: "/guidelines", icon: BookOpen },
  { title: "Reviews", url: "/reviews", icon: ClipboardCheck },
  { title: "Artifacts", url: "/artifacts", icon: Archive },
  { title: "References", url: "/references", icon: BookMarked },
  { title: "Archives", url: "/archives", icon: ArchiveIcon },
  { title: "Users", url: "/users", icon: Users },
  { title: "Audit Log", url: "/logs", icon: History },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  author: "Author",
  reviewer: "Reviewer",
};

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleConfirmLogout() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.name
    ? user.name
        .trim()
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Branding />
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
                      render={
                        <Link
                          href={item.url}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2",
                            isActive
                              ? "!bg-[#2F6B4F] !text-white hover:!bg-[#2F6B4F] hover:!text-white [&_svg]:!text-white"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        />
                      }
                      isActive={isActive}
                      className="p-0"
                    >
                      <item.icon className="size-4" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/profile"
            className="flex min-w-0 items-center gap-2 rounded-md hover:bg-muted"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2F6B4F]/15 text-sm font-medium text-[#2F6B4F]">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium leading-tight">
                {loading ? "Loading..." : (user?.email ?? "Not signed in")}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                {loading ? "" : user ? ROLE_LABELS[user.role] : ""}
              </span>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Log out"
            onClick={() => setLogoutOpen(true)}
            className={cn(
              "shrink-0 text-muted-foreground hover:text-foreground transition-colors",
            )}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your guidelines."
        confirmLabel="Sign out"
        destructive
        isConfirming={signingOut}
        onConfirm={handleConfirmLogout}
      />
    </Sidebar>
  );
}
