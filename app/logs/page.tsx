"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Guidelines/DataTable";
import { auditLogColumns } from "@/components/AuditLog/Columns";
import { AuditLogEntry } from "@/lib/auditLogWriter";

async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const res = await fetch("/api/audit-log");
  if (!res.ok) throw new Error("Failed to load audit log");
  return res.json();
}

export default function AuditLogPage() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["audit-log"],
    queryFn: fetchAuditLog,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <History size={20} />
        <h1 className="text-2xl font-bold">Audit log</h1>
      </div>

      <Card className="px-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : (
          <DataTable
            columns={auditLogColumns}
            data={entries ?? []}
            searchColumn="actorEmail"
            searchPlaceholder="Search by actor..."
          />
        )}
      </Card>
    </div>
  );
}
