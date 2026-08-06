"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useCreateGuideline } from "@/lib/hooks/useCreateGuideline";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
}

const Banner = () => {
  const { createGuideline, creating } = useCreateGuideline();
  const { user, loading: userLoading } = useCurrentUser();

  const firstName = user?.name?.trim().split(" ")[0] ?? "there";
  const canCreate = user?.role === "admin" || user?.role === "author";

  return (
    <div className="w-full">
      <div className="flex items-start gap-4">
        <Image
          src="/CPG_mascot.png"
          alt="CPG mascot"
          height={169}
          width={163}
          className="shrink-0"
        />
        <div>
          {userLoading ? (
            <div className="mt-6 space-y-2">
              <LoadingBar className="h-7 w-48" />
              <LoadingBar className="h-3 w-32" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mt-6">
                {getGreeting()}, {firstName}!
              </h1>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {getFormattedDate()}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="-mt-21 flex w-full items-center justify-end px-8 py-6 bg-[#2F6B4F] rounded-xl">
        <Button
          onClick={createGuideline}
          disabled={creating}
          className="gap-2 bg-[#2F6B4F] border-white text-white hover:bg-amber-50/25 hover:text-white"
        >
          <Plus size={24} />
          {creating ? "Creating..." : "New Guideline"}
        </Button>
      </div>
    </div>
  );
};

export default Banner;
