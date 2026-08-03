"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColumns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GuidelineWithVersions } from "@/constants";
import { Plus } from "lucide-react";
import { CreateGuidelineChoice } from "@/components/CreateGuidelineChoice";

async function fetchGuidelines(): Promise<GuidelineWithVersions[]> {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  const data: GuidelineWithVersions[] = await res.json();
  return data.filter((g) => g.status !== "archived");
}

export default function Guidelines() {
  const queryClient = useQueryClient();
  const [choiceOpen, setChoiceOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["guidelines-list"],
    queryFn: fetchGuidelines,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}/archive`, { method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] }),
  });

  const forcePublishMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}/force-publish`, { method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] }),
  });

  const columns = getColumns({
    onArchive: (id) => archiveMutation.mutate(id),
    onDelete: (id) => deleteMutation.mutate(id),
    onForcePublish: (id) => forcePublishMutation.mutate(id),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guidelines</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clinical practice guidelines.
            </p>
          </div>
          <Button
            onClick={() => setChoiceOpen(true)}
            className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          >
            <Plus size={18} />
            New Guideline
          </Button>
        </header>
        <Card className="mb-6 px-6">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading...
            </p>
          ) : (
            <DataTable columns={columns} data={data ?? []} />
          )}
        </Card>
      </div>

      <CreateGuidelineChoice open={choiceOpen} onOpenChange={setChoiceOpen} />
    </div>
  );
}
