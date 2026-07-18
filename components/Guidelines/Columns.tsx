"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { GuidelineWithVersions, VersionStatus } from "@/constants";
import { GitBranch, ArrowRight, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const statusStyles: Record<VersionStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  in_review: "bg-blue-100 text-blue-800",
  published: "bg-emerald-100 text-emerald-800",
  superseded: "bg-slate-100 text-slate-600",
};

const statusLabels: Record<VersionStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  superseded: "Superseded",
};

// Detects "parallel" releases: two or more versions sharing the same version_number
// (e.g. an inpatient track and an outpatient track published together)
function hasParallelVersions(
  versions: GuidelineWithVersions["versions"],
): boolean {
  const seen = new Set<string>();
  for (const v of versions) {
    if (seen.has(v.version_number)) return true;
    seen.add(v.version_number);
  }
  return false;
}

// Lightweight relative-time formatter, e.g. "12 min ago", "3 weeks ago"
function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export const columns: ColumnDef<GuidelineWithVersions>[] = [
  {
    accessorKey: "title",
    header: "CPG",
    cell: ({ row }) => {
      const guideline = row.original;
      const isParallel = hasParallelVersions(guideline.versions);
      return (
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="font-medium line-clamp-2 text-ellipsis overflow-hidden">
            {guideline.title}
          </span>
          {isParallel && (
            <span className="w-fit rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
              Parallel
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {guideline.societies.join(" · ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "specialty_tags",
    header: "Topic",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-normal break-words">
        {row.original.specialty_tags.join(", ")}
      </span>
    ),
  },
  {
    accessorKey: "versions",
    header: "Versions",
    cell: ({ row }) => {
      const versions = row.original.versions;
      const visible = versions.slice(0, 3);
      const extra = versions.length - visible.length;

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {visible.map((v) => (
            <span
              key={v.id}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[v.status]}`}
            >
              {v.version_number} · {statusLabels[v.status]}
            </span>
          ))}
          {extra > 0 && (
            <span className="text-xs text-muted-foreground">+{extra} more</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "guideline_type",
    header: ({ column }) => sortData(column, "Type"),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => (
      <span className="text-sm">{timeAgo(row.original.updated_at)}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const guideline = row.original;
      const isParallel = hasParallelVersions(guideline.versions);
      return (
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium ${
              isParallel
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-background"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Versions
          </button>
          <Link href={`/guidelines/${guideline.id}`}>
            <button className="flex items-center gap-1 text-sm font-medium">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      );
    },
  },
];

function sortData(
  column: Column<GuidelineWithVersions, unknown>,
  headerTitle: string,
): React.ReactElement {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {headerTitle}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
