"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Guidelines/DataTable";
import { LoadingBar } from "@/components/ui/loading-bar";
import {
  ClipboardList,
  CheckCircle2,
  MessageSquareWarning,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ReviewRow, getReviewColumns } from "@/components/Reviews/Columns";
import StatsCard from "@/components/Cards";

async function fetchReviews(): Promise<ReviewRow[]> {
  const res = await fetch("/api/reviews");
  if (!res.ok) throw new Error("Failed to load reviews");
  return res.json();
}

export default function Reviews() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const canReview = user?.role === "admin" || user?.role === "reviewer";

  const [changesDialogVersion, setChangesDialogVersion] =
    useState<ReviewRow | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews-list"],
    queryFn: fetchReviews,
  });

  const approveMutation = useMutation({
    mutationFn: (versionId: string) =>
      fetch(`/api/reviews/${versionId}/approve`, { method: "POST" }).then(
        (res) => {
          if (!res.ok) throw new Error("Failed to approve");
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reviews-list"] }),
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ versionId, note }: { versionId: string; note: string }) =>
      fetch(`/api/reviews/${versionId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to request changes");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews-list"] });
      setChangesDialogVersion(null);
      setNote("");
    },
  });

  const columns = getReviewColumns({
    canReview,
    onApprove: (versionId) => approveMutation.mutate(versionId),
    onRequestChanges: (row) => setChangesDialogVersion(row),
  });

  const pendingCount =
    data?.filter((r) => r.status === "in_review").length ?? 0;
  const publishedCount =
    data?.filter((r) => r.status === "published").length ?? 0;
  const changesRequestedCount =
    data?.filter((r) => r.status === "changes_requested").length ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve guideline versions or send them back for changes before they
          go live.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Card className="px-4">
              <div className="flex items-center gap-3">
                <LoadingBar className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <LoadingBar className="h-6 w-10" />
                  <LoadingBar className="h-3 w-20" />
                </div>
              </div>
            </Card>
            <Card className="px-4">
              <div className="flex items-center gap-3">
                <LoadingBar className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <LoadingBar className="h-6 w-10" />
                  <LoadingBar className="h-3 w-20" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <LoadingBar className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <LoadingBar className="h-6 w-10" />
                  <LoadingBar className="h-3 w-20" />
                </div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <StatsCard
              icon={ClipboardList}
              label="In review"
              value={pendingCount}
            />
            <StatsCard
              icon={CheckCircle2}
              label="Published"
              value={publishedCount}
              iconClassName="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"
            />
            <StatsCard
              icon={MessageSquareWarning}
              label="Changes requested"
              value={changesRequestedCount}
              iconClassName="rounded-lg bg-amber-500/10 p-2 text-amber-600"
            />
          </>
        )}
      </div>

      <Card className="mb-6 px-6">
        {isLoading ? (
          <div className="space-y-3 py-6">
            <LoadingBar className="h-9 w-64" />
            <LoadingBar className="h-10 w-full" />
            <LoadingBar className="h-10 w-full" />
            <LoadingBar className="h-10 w-full" />
            <LoadingBar className="h-10 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data ?? []}
            searchColumn="guidelines_title"
            searchPlaceholder="Search..."
          />
        )}
      </Card>

      <Dialog
        open={!!changesDialogVersion}
        onOpenChange={(open) => !open && setChangesDialogVersion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What needs to change before this can be approved?"
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setChangesDialogVersion(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              disabled={!note.trim() || requestChangesMutation.isPending}
              onClick={() =>
                changesDialogVersion &&
                requestChangesMutation.mutate({
                  versionId: changesDialogVersion.id,
                  note: note.trim(),
                })
              }
            >
              {requestChangesMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
