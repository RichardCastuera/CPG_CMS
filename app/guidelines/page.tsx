"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColumns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { CreateGuidelineChoice } from "@/components/CreateGuidelineChoice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GuidelineWithVersions } from "@/constants";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  FileEdit,
  ClipboardCheck,
} from "lucide-react";
import { LoadingBar } from "@/components/ui/loading-bar";
import StatsCard from "@/components/Cards";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

async function fetchGuidelines(): Promise<GuidelineWithVersions[]> {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  return res.json();
}

async function fetchMe() {
  const res = await fetch("/api/me");
  if (!res.ok) return null;
  return res.json();
}

function StatCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <LoadingBar className="h-9 w-9 rounded-lg" />
        <div className="space-y-2">
          <LoadingBar className="h-6 w-10" />
          <LoadingBar className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

function GuidelinesTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <LoadingBar className="h-10 w-full max-w-sm" />
      <div className="overflow-hidden rounded-md border">
        <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
          <LoadingBar className="h-4 w-40" />
          <LoadingBar className="ml-auto h-4 w-16" />
          <LoadingBar className="h-4 w-28" />
          <LoadingBar className="h-4 w-20" />
          <LoadingBar className="h-4 w-16" />
          <LoadingBar className="h-4 w-6" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <LoadingBar className="h-4 w-56" />
            <LoadingBar className="ml-auto h-5 w-24 rounded-full" />
            <LoadingBar className="h-4 w-24" />
            <LoadingBar className="h-4 w-16" />
            <LoadingBar className="h-4 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

type PendingAction = {
  type: "archive" | "delete";
  id: string;
} | null;

export default function Guidelines() {
  const queryClient = useQueryClient();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["guidelines-list"],
    queryFn: fetchGuidelines,
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
  const canCreate = me?.role === "admin" || me?.role === "author";

  const archiveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}/archive`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] });
      setPending(null);
      toast.success("Guideline archived");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to archive guideline",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] });
      setPending(null);
      toast.success("Guideline deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete guideline",
      );
    },
  });

  const forcePublishMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${id}/force-publish`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guidelines-list"] });
      toast.success("Guideline force-published");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to force-publish guideline",
      );
    },
  });

  const columns = getColumns({
    onArchive: (id) => setPending({ type: "archive", id }),
    onDelete: (id) => setPending({ type: "delete", id }),
    onForcePublish: (id) => forcePublishMutation.mutate(id),
  });

  const guidelines = data ?? [];
  const total = guidelines.length;
  const published = guidelines.filter(
    (g: any) => g.status === "published",
  ).length;
  const drafts = guidelines.filter((g: any) => g.status === "draft").length;
  const inReview = guidelines.filter(
    (g: any) => g.status === "in_review",
  ).length;

  const isConfirming =
    pending?.type === "archive"
      ? archiveMutation.isPending
      : pending?.type === "delete"
        ? deleteMutation.isPending
        : false;

  const confirmError =
    pending?.type === "archive"
      ? archiveMutation.error instanceof Error
        ? archiveMutation.error.message
        : null
      : pending?.type === "delete"
        ? deleteMutation.error instanceof Error
          ? deleteMutation.error.message
          : null
        : null;

  function handleConfirm() {
    if (!pending) return;
    if (pending.type === "archive") {
      archiveMutation.mutate(pending.id);
    } else {
      deleteMutation.mutate(pending.id);
    }
  }

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
          {canCreate && (
            <Button
              onClick={() => setChoiceOpen(true)}
              className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
            >
              <Plus size={18} />
              New Guideline
            </Button>
          )}
        </header>

        {/* Status overview */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#2F6B4F]/10 p-2 text-[#2F6B4F]">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>

              <StatsCard
                icon={CheckCircle2}
                label="Published"
                value={published}
              />
              <StatsCard icon={FileEdit} label="Draft" value={drafts} />
              <StatsCard
                icon={ClipboardCheck}
                label="In review"
                value={inReview}
              />
            </>
          )}
        </div>

        <Card className="mb-6 px-6">
          {isLoading ? (
            <div className="py-6">
              <GuidelinesTableSkeleton rows={8} />
            </div>
          ) : (
            <DataTable columns={columns} data={guidelines} />
          )}
        </Card>
      </div>

      {canCreate && (
        <CreateGuidelineChoice open={choiceOpen} onOpenChange={setChoiceOpen} />
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={
          pending?.type === "archive"
            ? "Archive guideline?"
            : "Delete guideline?"
        }
        description={
          pending?.type === "archive"
            ? "This guideline will be moved to the archive and hidden from active lists. You can restore it later."
            : "This will permanently delete the guideline and all of its versions. This action cannot be undone."
        }
        confirmLabel={pending?.type === "archive" ? "Archive" : "Delete"}
        destructive={pending?.type === "delete"}
        isConfirming={isConfirming}
        errorMessage={confirmError}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
