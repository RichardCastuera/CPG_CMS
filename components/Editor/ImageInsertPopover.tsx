// components/editor/ImageInsertPopover.tsx
"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

interface Artifact {
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
}

interface ImageInsertPopoverProps {
  guidelineId?: string;
  onSelect: (url: string) => void;
  children: React.ReactNode;
}

async function fetchArtifacts(guidelineId: string): Promise<Artifact[]> {
  const res = await fetch(`/api/guidelines/${guidelineId}/artifacts`);
  if (!res.ok) throw new Error("Failed to load artifacts");
  return res.json();
}

export function ImageInsertPopover({
  guidelineId,
  onSelect,
  children,
}: ImageInsertPopoverProps) {
  const [open, setOpen] = useState(false);

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["artifacts", guidelineId],
    queryFn: () => fetchArtifacts(guidelineId!),
    enabled: open && !!guidelineId, // only fetch once the popover is actually opened
  });

  function handlePick(artifact: Artifact) {
    onSelect(artifact.url);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="mb-2 text-sm font-medium text-emerald-700">
          Pick from artifacts
        </p>

        {isLoading && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Loading...
          </p>
        )}

        {!isLoading && artifacts && artifacts.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No artifacts yet
          </p>
        )}

        {!isLoading && artifacts && artifacts.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => handlePick(artifact)}
                className="aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-emerald-600"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artifact.thumbnailUrl}
                  alt={artifact.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Drag &amp; drop uploads are supported from the Artifacts panel.
        </p>
      </PopoverContent>
    </Popover>
  );
}
