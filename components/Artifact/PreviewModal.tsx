"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  name?: string;
}

export default function PreviewModal({
  open,
  onOpenChange,
  url,
  name,
}: PreviewModalProps) {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle>{name ?? "Preview"}</DialogTitle>
          <DialogDescription>Preview artifact</DialogDescription>
        </DialogHeader>

        <div className="mt-2 h-[calc(100%-6rem)] overflow-hidden rounded-md border">
          {isPdf ? (
            <iframe src={url} className="h-full w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={name}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
