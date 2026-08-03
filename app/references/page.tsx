"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/Guidelines/DataTable";
import { NewReferenceDialog } from "@/components/References/NewReferenceDialog";
import { NewReferenceInput } from "@/lib/references";
import {
  LibraryReference,
  referenceColumns,
} from "@/components/References/Column";

async function fetchReferences(): Promise<LibraryReference[]> {
  const res = await fetch("/api/references");
  if (!res.ok) throw new Error("Failed to load references");
  return res.json();
}

export default function ReferencesPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["references-list"],
    queryFn: fetchReferences,
  });

  const addMutation = useMutation({
    mutationFn: (input: NewReferenceInput) =>
      fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to add reference");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references-list"] });
      setAddOpen(false);
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">References</h1>
          <p className="text-sm text-muted-foreground">
            Central citation library. Add a reference once, then cite it from
            any guideline.
          </p>
        </div>
        <Button
          className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} />
          Add reference
        </Button>
      </div>

      <Card className="px-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : (
          <DataTable
            columns={referenceColumns}
            data={data ?? []}
            searchColumn="label"
            searchPlaceholder="Search references..."
          />
        )}
      </Card>

      <NewReferenceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={(input) => addMutation.mutate(input)}
        isCreating={addMutation.isPending}
        submitLabel="Add reference"
        submittingLabel="Adding..."
      />
    </div>
  );
}
