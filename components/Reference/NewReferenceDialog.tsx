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
}

export function NewReferenceDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
}: NewReferenceDialogProps) {
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [volumeIssuePages, setVolumeIssuePages] = useState("");
  const [doiOrUrl, setDoiOrUrl] = useState("");

  function reset() {
    setAuthors("");
    setYear("");
    setTitle("");
    setJournal("");
    setVolumeIssuePages("");
    setDoiOrUrl("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  const canCreate = Boolean(authors.trim() && year.trim() && journal.trim());

  function handleCreate() {
    if (!canCreate) return;
    onCreate({
      authors: authors.trim(),
      year: year.trim(),
      title: title.trim() || undefined,
      journal: journal.trim(),
      volumeIssuePages: volumeIssuePages.trim(),
      doiOrUrl: doiOrUrl.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New reference</DialogTitle>
          <DialogDescription>
            Add a citation not already in the library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Authors <span className="text-destructive">*</span>
              </label>
              <Input
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="Bradley JS, et al."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Year <span className="text-destructive">*</span>
              </label>
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
              placeholder="Article or study title"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Journal <span className="text-destructive">*</span>
            </label>
            <Input
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Clin Infect Dis"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Volume / Issue / Pages
            </label>
            <Input
              value={volumeIssuePages}
              onChange={(e) => setVolumeIssuePages(e.target.value)}
              placeholder="2011;53(7):e25-76"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">DOI or URL (optional)</label>
            <Input
              value={doiOrUrl}
              onChange={(e) => setDoiOrUrl(e.target.value)}
              placeholder="10.1093/cid/cir531"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
            className="bg-[#2F6B4F] hover:bg-[#255d40]"
          >
            {isCreating ? "Adding..." : "Add reference"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
