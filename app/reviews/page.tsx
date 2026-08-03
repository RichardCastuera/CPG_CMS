"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/Guidelines/DataTable";

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

async function fetchReviews(): Promise<ReviewRow[]> {
  const res = await fetch("/api/reviews");
  if (!res.ok) throw new Error("Failed to load reviews");
  return res.json();
}

export default function Reviews() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const canReview = user?.role === "admin" || user?.role === "reviewer";

  const [changesDialogVersion, setChangesDialogVersion] = useState<ReviewRow | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews-list"],
    queryFn: fetchReviews,
  });

  const approveMutation = useMutation({
    mutationFn: (versionId: string) =>
      fetch(`/api/reviews/${versionId}/approve`, { method: "POST" }).then((res) => {
        if (!res.ok) throw new Error("Failed to approve");
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews-list"] }),
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

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Reviews</h1>

      <Card className="mb-6 px-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data ?? []}
            searchColumn="guidelines_title"
            searchPlaceholder="Search..."
          />
        )}
      </Card>

      <Dialog open={!!changesDialogVersion} onOpenChange={(open) => !open && setChangesDialogVersion(null)}>
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
            <Button variant="ghost" onClick={() => setChangesDialogVersion(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
              disabled={!note.trim() || requestChangesMutation.isPending}
              onClick={() =>
                changesDialogVersion &&
                requestChangesMutation.mutate({ versionId: changesDialogVersion.id, note: note.trim() })
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