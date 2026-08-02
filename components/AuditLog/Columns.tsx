"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AuditLogEntry } from "@/lib/auditLogWriter";

function formatTimestamp(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16).replace("T", " ");
}

export const auditLogColumns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {formatTimestamp(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: "actorEmail",
    header: "Actor",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-blue-700">
        {row.original.actorEmail}
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
