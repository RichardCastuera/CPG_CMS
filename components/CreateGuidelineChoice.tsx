// components/CreateGuidelineChoice.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CreateGuidelineChoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGuidelineChoice({
  open,
  onOpenChange,
}: CreateGuidelineChoiceProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createGuideline(payload: Record<string, unknown>) {
    setCreating(true);
    try {
      const res = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to create guideline");
      }

      const { id, versionId } = await res.json();
      onOpenChange(false);
      router.push(`/guidelines/${id}/versions/${versionId}?view=info`);
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  }

  function handleStartFromScratch() {
    createGuideline({
      title: "Untitled guideline",
      guideline_type: "Interim",
      version_number: "v1.0",
      source: "authored",
    });
  }

  function handleImportExisting() {
    createGuideline({
      title: "Untitled guideline",
      guideline_type: "Compendium",
      version_number: "v1.0",
      status: "published",
      source: "imported",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New guideline</DialogTitle>
          <DialogDescription>
            How would you like to add this guideline?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <button
            onClick={handleStartFromScratch}
            disabled={creating}
            className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/50 disabled:opacity-50"
          >
            <FilePlus size={20} className="mt-0.5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-medium">Start from scratch</p>
              <p className="text-sm text-muted-foreground">
                Draft a new guideline in the editor, starting as v1.0.
              </p>
            </div>
          </button>

          <button
            onClick={handleImportExisting}
            disabled={creating}
            className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-emerald-600 hover:bg-emerald-50/50 disabled:opacity-50"
          >
            <UploadCloud size={20} className="mt-0.5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-medium">Import an existing guideline</p>
              <p className="text-sm text-muted-foreground">
                Catalogue a guideline that's already been published elsewhere.
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
