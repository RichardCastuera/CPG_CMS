"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, BookMarked, X, Link2, CircleOff } from "lucide-react";
import { RowSelectionState } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/Guidelines/DataTable";
import { NewReferenceDialog } from "@/components/References/NewReferenceDialog";
import { NewReferenceInput } from "@/lib/references";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LibraryReference,
  getReferenceColumns,
} from "@/components/References/Column";
import StatsCard from "@/components/Cards";

type BlockedReference = {
  id: string;
  label: string;
  citedIn: string[];
};

type DeleteApiError = Error & { blocked?: BlockedReference[] };

type PendingDelete =
  | { mode: "single"; reference: LibraryReference }
  | { mode: "bulk" };

async function fetchReferences(): Promise<LibraryReference[]> {
  const res = await fetch("/api/references");
  if (!res.ok) throw new Error("Failed to load references");
  return res.json();
}

async function deleteReferences(ids: string[]) {
  const res = await fetch("/api/references", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err: DeleteApiError = new Error(
      body?.error ?? "Failed to delete reference(s)",
    );
    err.blocked = body?.blocked;
    throw err;
  }
  return res.json();
}

export default function ReferencesPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleteBlocked, setDeleteBlocked] = useState<BlockedReference[] | null>(
    null,
  );

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

  const deleteMutation = useMutation({
    mutationFn: deleteReferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references-list"] });
      setRowSelection({});
      setPendingDelete(null);
      setDeleteBlocked(null);
    },
    onError: (err: DeleteApiError) => {
      setDeleteBlocked(err.blocked ?? null);
    },
  });

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );

  const columns = useMemo(
    () =>
      getReferenceColumns((reference) => {
        setDeleteBlocked(null);
        setPendingDelete({ mode: "single", reference });
      }),
    [],
  );

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.mode === "single") {
      deleteMutation.mutate([pendingDelete.reference.id]);
    } else {
      deleteMutation.mutate(selectedIds);
    }
  };

  const references = data ?? [];

  const bulkActionsBar = (
    <div className="flex items-center gap-2 rounded-md border border-[#2F6B4F]/30 bg-[#2F6B4F]/5 px-3 py-1.5">
      <span className="text-sm font-medium text-[#2F6B4F]">
        {selectedIds.length} selected
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2"
        onClick={() => setRowSelection({})}
      >
        <X size={13} />
        Clear
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-7 gap-1 px-2"
        onClick={() => {
          setDeleteBlocked(null);
          setPendingDelete({ mode: "bulk" });
        }}
      >
        <Trash2 size={13} />
        Delete
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">References</h1>
            <p className="text-sm text-muted-foreground">
              Central citation library. Add a reference once, then cite it from
              any guideline.
            </p>
          </div>
        </div>
        <Button
          className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} />
          Add reference
        </Button>
      </div>

      {/* Stats strip */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            icon={BookMarked}
            label="Total references"
            value={references.length}
          />
          <StatsCard
            icon={Link2}
            label="With DOI / URL"
            value={references.filter((r) => r.doi_or_url).length}
          />
          <StatsCard
            icon={CircleOff}
            label="Uncited"
            value={references.filter((r) => r.citedIn.length === 0).length}
          />
        </div>
      )}

      <Card className="px-6 py-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : references.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <BookMarked size={28} className="text-muted-foreground" />
            <p className="text-sm font-medium">No references yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first reference to start citing it from guidelines.
            </p>
            <Button
              size="sm"
              className="mt-2 gap-1.5 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={14} />
              Add reference
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={references}
            searchColumn="label"
            searchPlaceholder="Search references..."
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row.id}
            bulkActionsBar={bulkActionsBar}
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

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteBlocked(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.mode === "single"
                ? "Delete this reference?"
                : `Delete ${selectedIds.length} reference${
                    selectedIds.length > 1 ? "s" : ""
                  }?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.mode === "single"
                ? `"${pendingDelete.reference.label}" will be permanently removed.`
                : "These references will be permanently removed."}{" "}
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteBlocked && deleteBlocked.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">
                {deleteBlocked.length} reference
                {deleteBlocked.length > 1 ? "s are" : " is"} still cited and
                can&apos;t be deleted:
              </p>
              <ul className="mt-1.5 space-y-1">
                {deleteBlocked.map((b) => (
                  <li key={b.id}>
                    <span className="font-medium">{b.label}</span> — cited in{" "}
                    {b.citedIn.slice(0, 2).join(", ")}
                    {b.citedIn.length > 2
                      ? ` +${b.citedIn.length - 2} more`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-600/90"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
