"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColumns } from "@/components/Archives/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Archive, FileText, Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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
      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold">Archive</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 p-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Archive className="h-3.5 w-3.5" />
              Archived guidelines
            </div>
            <div className="text-3xl font-bold">{data?.length ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Retention window
              </div>
              <div className="text-3xl font-bold">
                {retentionYears ?? "—"}{" "}
                <span className="text-lg font-normal text-muted-foreground">
                  yrs
                </span>
              </div>
            </div>

            {isEditingRetention ? (
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
                onClick={() => {
                  setRetentionInput(String(retentionYears ?? ""));
                  setIsEditingRetention(true);
                }}
              >
                Change
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="px-6">
        <div className="flex items-center gap-2 pt-6">
          <h2 className="text-sm font-semibold">Archived guidelines</h2>
          <Tooltip>
            <TooltipTrigger
              render={
                <button className="text-muted-foreground hover:text-foreground">
                  <Info size={14} />
                </button>
              }
            />
            <TooltipContent className="max-w-xs">
              A nightly job archives any published guideline whose current
              version exceeds the retention window above. Admins can also
              archive manually from a guideline's actions menu at any time.
            </TooltipContent>
          </Tooltip>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={data ?? []}
            searchColumn="title"
            searchPlaceholder="Search archive"
          />
        )}
      </Card>
    </div>
  );
}
