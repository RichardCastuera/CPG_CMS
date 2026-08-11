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

const IMAGE_FORMATS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  name?: string;
  fileFormat?: string;
}

function PreviewImage({ url, name }: { url: string; name?: string }) {
  const [imageError, setImageError] = React.useState(false);

  if (imageError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
        <p>This image couldn&apos;t be loaded.</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name ?? "Preview"}
      className="h-full w-full object-contain"
      onError={() => setImageError(true)}
    />
  );
}

export default function PreviewModal({
  open,
  onOpenChange,
  url,
  name,
  fileFormat,
}: PreviewModalProps) {
  const format = fileFormat?.toLowerCase();
  const isPdf = format
    ? format === "pdf"
    : (url?.toLowerCase().split("?")[0].endsWith(".pdf") ?? false);
  const isImage = format
    ? IMAGE_FORMATS.includes(format)
    : url
      ? IMAGE_FORMATS.some((ext) =>
          url.toLowerCase().split("?")[0].endsWith(`.${ext}`),
        )
      : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] w-[90vw] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="truncate pr-6">
            {name ?? "Preview"}
          </DialogTitle>
          <DialogDescription>Preview artifact</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden bg-muted/20">
          {!url ? null : isPdf ? (
            <iframe
              src={url}
              className="h-full w-full"
              title={name ?? "Preview"}
            />
          ) : isImage ? (
            <PreviewImage key={url} url={url} name={name} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <p>Preview isn&apos;t supported for this file type.</p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {url && (
            <Button
              className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              onClick={() => window.open(url, "_blank")}
            >
              Open in new tab
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
