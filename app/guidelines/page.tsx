"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColumns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { NewGuidelineButton } from "@/components/NewGuidelineButton";
import { Card } from "@/components/ui/card";
import { GuidelineWithVersions } from "@/constants";
import { Plus } from "lucide-react";

async function fetchGuidelines(): Promise<GuidelineWithVersions[]> {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  return res.json();
}

export default function Guidelines() {
  const queryClient = useQueryClient();

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

  const columns = getColumns({
    onArchive: (id) => archiveMutation.mutate(id),
    onDelete: (id) => deleteMutation.mutate(id),
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
          <NewGuidelineButton
            href={"/guidelines/create_guideline"}
            icon={<Plus size={24}></Plus>}
            title={"New Guideline"}
          />
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
    </div>
  );
}
