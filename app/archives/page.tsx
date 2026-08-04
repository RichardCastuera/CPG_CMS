"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColumns } from "@/components/Archives/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Archive, CalendarClock, Info, Pencil } from "lucide-react";
import StatsCard from "@/components/Cards";

async function fetchArchives() {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  const data = await res.json();
  return data.filter((g: any) => g.status === "archived");
}

async function fetchRetention(): Promise<number> {
  const res = await fetch("/api/settings/archive-retention");
  if (!res.ok) throw new Error("Failed to load setting");
  const { years } = await res.json();
  return years;
}

export default function ArchivesPage() {
  const queryClient = useQueryClient();
  const [retentionInput, setRetentionInput] = useState<string>("");
  const [isEditingRetention, setIsEditingRetention] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["guidelines-archived"],
    queryFn: fetchArchives,
  });

  const { data: retentionYears } = useQuery({
    queryKey: ["archive-retention"],
    queryFn: fetchRetention,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}/restore`, { method: "POST" }).then(
        async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error ?? "Failed to restore");
          }
          return res.json();
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines-archived"] });
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] });
    },
  });

  const retentionMutation = useMutation({
    mutationFn: (years: number) =>
      fetch("/api/settings/archive-retention", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ years }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive-retention"] });
      setIsEditingRetention(false);
      setRetentionInput("");
    },
  });

  const columns = getColumns((id) =>
    restoreMutation.mutate(id, {
      onError: (err: any) => alert(err?.message ?? "Failed to restore"),
    }),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Archive</h1>
          <p className="text-sm text-muted-foreground">
            Archived guidelines are kept, not deleted. Any version can be
            restored at any time.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatsCard
          icon={Archive}
          label="Archived guidelines"
          value={data?.length ?? 0}
          iconClassName="rounded-lg bg-slate-100 p-2 text-slate-600"
        />

        <StatsCard
          icon={CalendarClock}
          label="Retention window"
          value={retentionYears ?? "—"}
          valueSuffix="yrs"
          action={
            isEditingRetention ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={retentionInput}
                  onChange={(e) => setRetentionInput(e.target.value)}
                  className="h-9 w-20"
                  autoFocus
                />
                <Button
                  size="sm"
                  disabled={!retentionInput || retentionMutation.isPending}
                  onClick={() =>
                    retentionMutation.mutate(Number(retentionInput))
                  }
                  className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingRetention(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setRetentionInput(String(retentionYears ?? ""));
                  setIsEditingRetention(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Change
              </Button>
            )
          }
        />
      </div>

      {/* Archived guidelines table */}
      <Card className="border-slate-200 shadow-none">
        <div className="space-y-4 px-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-xs leading-relaxed text-slate-600">
                A guideline is archived automatically once its current version
                passes the retention window above. An admin may also archive a
                guideline manually from its actions menu.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </p>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Archive className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium">No archived guidelines</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Guidelines will appear here once archived manually or
                automatically after the retention window above.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data ?? []}
              searchColumn="title"
              searchPlaceholder="Search archive"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
