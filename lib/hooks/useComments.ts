// lib/hooks/useComments.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Comment } from "@/lib/comments";

async function fetchComments(guidelineId: string, nodeId: string): Promise<Comment[]> {
  const res = await fetch(`/api/guidelines/${guidelineId}/nodes/${nodeId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export function useComments(guidelineId: string, nodeId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["comments", guidelineId, nodeId],
    queryFn: () => fetchComments(guidelineId, nodeId),
    enabled: nodeId.length > 0,
  });

  const addMutation = useMutation({
    mutationFn: (body: string) =>
      fetch(`/api/guidelines/${guidelineId}/nodes/${nodeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }).then((res) => res.json()),
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(["comments", guidelineId, nodeId], (prev) => [
        ...(prev ?? []),
        newComment,
      ]);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      fetch(`/api/guidelines/${guidelineId}/nodes/${nodeId}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      }).then((res) => res.json()),
    onSuccess: (updated) => {
      queryClient.setQueryData<Comment[]>(["comments", guidelineId, nodeId], (prev) =>
        (prev ?? []).map((c) => (c.id === updated.id ? updated : c))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${guidelineId}/nodes/${nodeId}/comments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<Comment[]>(["comments", guidelineId, nodeId], (prev) =>
        (prev ?? []).filter((c) => c.id !== id)
      );
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    addComment: addMutation.mutate,
    isAdding: addMutation.isPending,
    toggleResolved: resolveMutation.mutate,
    deleteComment: deleteMutation.mutate,
  };
}