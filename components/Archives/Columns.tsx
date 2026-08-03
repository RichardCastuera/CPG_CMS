"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GuidelineWithVersions } from "@/constants";
import { Button } from "../ui/button";
import { RotateCcw } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function archivedDuration(archivedAtIso: string): string {
  const days = Math.floor(
    (Date.now() - new Date(archivedAtIso).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}yrs`;
}

export function getColumns(
  onRestore: (id: string) => void,
): ColumnDef<GuidelineWithVersions>[] {
  return [
    {
      accessorKey: "title",
      header: "CPG · Version",
      cell: ({ row }) => {
        const guideline = row.original;
        const version =
          guideline.versions.find(
            (v) => v.id === guideline.current_version_id,
          ) ?? guideline.versions[0];

        return (
          <div className="flex max-w-sm flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              {guideline.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {guideline.societies.join(" · ")}
              {version && ` · ${version.version_number}`}
            </span>
          </div>
        );
      },
    },
    {
      id: "published",
      header: "Published",
      cell: ({ row }) => {
        const version = row.original.versions.find(
          (v) => v.id === row.original.current_version_id,
        );
        const published = version?.published_at ?? version?.effective_date;
        return (
          <span className="text-sm text-muted-foreground">
            {published ? formatDate(published) : "—"}
          </span>
        );
      },
    },
    {
      id: "archivedFor",
      header: "Archived for",
      cell: ({ row }) => (
        <span className="rounded-full border bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {archivedDuration(row.original.updated_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => onRestore(row.original.id)}
          >
            <RotateCcw size={14} />
            Restore
          </Button>
        </div>
      ),
    },
  ];
}
