// components/AuditLog/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AuditLogEntry } from "@/lib/auditLogWriter";

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—"; // defensive guard against any future bad data
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export const auditLogColumns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "created_at",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {formatTimestamp(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "actorEmail",
    header: "Actor",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-blue-700">
        {row.original.actorEmail ?? row.original.profiles?.name ?? "Unknown"}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.action}</span>
    ),
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.target}</span>
    ),
  },
];
