"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Guideline, VersionStatus } from "@/constants";
import { GitBranch, ArrowRight, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

const statusStyles: Record<VersionStatus, string> = {
  Draft: "bg-amber-100 text-amber-800",
  Active: "bg-emerald-100 text-emerald-800",
  Superseded: "bg-slate-100 text-slate-600",
  Withdrawn: "bg-rose-100 text-rose-700",
};

export const columns: ColumnDef<Guideline>[] = [
  {
    accessorKey: "title",
    header: "CPG",
    cell: ({ row }) => {
      const guideline = row.original;
      return (
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="font-medium line-clamp-2 text-ellipsis overflow-hidden">
            {guideline.title}
          </span>
          {guideline.isParallel && (
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
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-normal break-words">
        {row.original.topic.join(", ")}
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
          {visible.map((v, i) => (
            <span
              key={i}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[v.status]}`}
            >
              {v.version} · {v.status}
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
    accessorKey: "type",
    header: ({ column, header }) => {
      return sortData(column, "Type");
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const guideline = row.original;
      return (
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium ${
              guideline.isParallel
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-background"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Versions
          </button>
          <button className="flex items-center gap-1 text-sm font-medium">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    },
  },
];
function sortData(
  column: Column<Guideline, unknown>,
  headerTitle: string,
): any {
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
