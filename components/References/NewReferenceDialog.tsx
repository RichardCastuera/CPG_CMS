"use client";

import { useState } from "react";
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
import { NewReferenceInput } from "@/lib/references";

interface NewReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewReferenceInput) => void;
  isCreating?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
}

export function NewReferenceDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
  submitLabel = "Add & attach",
  submittingLabel = "Adding...",
}: NewReferenceDialogProps) {
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [volumeIssuePages, setVolumeIssuePages] = useState("");
  const [doiOrUrl, setDoiOrUrl] = useState("");

  const canSubmit =
    authors.trim() && year.trim() && journal.trim() && volumeIssuePages.trim();

  function handleSubmit() {
    if (!canSubmit) return;
    onCreate({
      authors: authors.trim(),
      year: year.trim(),
      title: title.trim() || undefined,
      journal: journal.trim(),
      volumeIssuePages: volumeIssuePages.trim(),
      doiOrUrl: doiOrUrl.trim() || undefined,
    });
    setAuthors("");
    setYear("");
    setTitle("");
    setJournal("");
    setVolumeIssuePages("");
    setDoiOrUrl("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New reference</DialogTitle>
          <DialogDescription>
            Add a new citation and attach it to this guideline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Authors</label>
              <Input
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Bradley JS, et al."
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Year</label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2011"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The management of community-acquired pneumonia..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Journal</label>
            <Input
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Clin Infect Dis"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Volume/Issue/Pages</label>
            <Input
              value={volumeIssuePages}
              onChange={(e) => setVolumeIssuePages(e.target.value)}
              placeholder="2011;53(7):e25-76"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">DOI / URL (optional)</label>
            <Input
              value={doiOrUrl}
              onChange={(e) => setDoiOrUrl(e.target.value)}
              placeholder="https://doi.org/..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || isCreating}
            onClick={handleSubmit}
            className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          >
            {isCreating ? submittingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}