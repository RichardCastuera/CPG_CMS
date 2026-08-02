"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FilePlus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

async function fetchMe() {
  const res = await fetch("/api/me");
  if (!res.ok) return null;
  return res.json();
}

interface CreateGuidelineChoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGuidelineChoice({
  open,
  onOpenChange,
}: CreateGuidelineChoiceProps) {
  const router = useRouter();
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const isAdmin = me?.role === "admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a guideline</DialogTitle>
          <DialogDescription>
            Choose how you want to add this guideline.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => router.push("/guidelines/create_guideline?mode=new")}
            className="flex items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/50"
          >
            <FilePlus size={20} className="mt-0.5 shrink-0 text-[#2F6B4F]" />
            <div>
              <p className="font-medium">New guideline</p>
              <p className="text-sm text-muted-foreground">
                Start authoring a new guideline from scratch. Begins as a draft.
              </p>
            </div>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                router.push("/guidelines/create_guideline?mode=import")
              }
              className="flex items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/50"
            >
              <Upload size={20} className="mt-0.5 shrink-0 text-[#2F6B4F]" />
              <div>
                <p className="font-medium">Import existing guideline</p>
                <p className="text-sm text-muted-foreground">
                  Bring in a guideline already published outside this system.
                </p>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
