"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";

interface VersionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "rename";
  initialValue?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (versionNumber: string) => void;
}

export function VersionFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue = "",
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}: VersionFormDialogProps) {
  const [versionNumber, setVersionNumber] = useState(initialValue);

  useEffect(() => {
    if (open) setVersionNumber(initialValue);
  }, [open, initialValue]);

  function handleSubmit() {
    const trimmed = versionNumber.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create new version" : "Rename version"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "This will clone the active version's content into a new draft."
              : "Update the version number shown in the timeline."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <FieldLabel htmlFor="version-number">Version number</FieldLabel>
          <Input
            id="version-number"
            value={versionNumber}
            onChange={(e) => setVersionNumber(e.target.value)}
            placeholder="v4.0"
            autoComplete="off"
            autoFocus
            aria-invalid={!!errorMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !versionNumber.trim()}
            className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          >
            {isSubmitting
              ? isCreate
                ? "Creating..."
                : "Saving..."
              : isCreate
                ? "Create"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
