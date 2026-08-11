"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Guidelines/DataTable";
import { LoadingBar } from "@/components/ui/loading-bar";
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
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          A record of who did what and when, across guidelines, reviews, and
          references.
        </p>
      </div>

      <Card className="px-6">
        {isLoading ? (
          <div className="space-y-3 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingBar key={i} className="h-10 w-full" />
            ))}
          </div>
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
