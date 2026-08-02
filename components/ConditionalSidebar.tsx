// components/ConditionalSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/SideBar";
import { TooltipProvider } from "@/components/ui/tooltip";

const HIDDEN_SIDEBAR_ROUTES = ["/login", "/signup"];

function isEditorRoute(pathname: string): boolean {
  // Matches /guidelines/{id}/versions/{versionId} specifically —
  // the full-screen tree editor — without catching /guidelines/create_guideline
  // or /guidelines/{id}/versions (the timeline list page).
  return /^\/guidelines\/[^/]+\/versions\/[^/]+/.test(pathname);
}

export function ConditionalSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar =
    HIDDEN_SIDEBAR_ROUTES.some((route) => pathname.startsWith(route)) ||
    isEditorRoute(pathname);

  if (hideSidebar) {
    return (
      <main className="flex w-full flex-1 flex-col">
        <TooltipProvider>
          <div>{children}</div>
        </TooltipProvider>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-1 flex-col">
        <SidebarTrigger />
        <TooltipProvider>
          <div className="mx-6">{children}</div>
        </TooltipProvider>
      </main>
    </SidebarProvider>
  );
}
