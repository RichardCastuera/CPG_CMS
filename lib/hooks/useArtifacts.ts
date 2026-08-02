"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Artifact, ArtifactCategory } from "@/lib/artifacts";

async function fetchArtifacts(guidelineId: string): Promise<Artifact[]> {
  const res = await fetch(`/api/guidelines/${guidelineId}/artifacts`);
  if (!res.ok) throw new Error("Failed to load artifacts");
  return res.json();
}

async function uploadArtifact(
  guidelineId: string,
  file: File,
  category: ArtifactCategory,
): Promise<Artifact> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  const res = await fetch(`/api/guidelines/${guidelineId}/artifacts`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function useArtifacts(guidelineId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["artifacts", guidelineId],
    queryFn: () => fetchArtifacts(guidelineId),
  });

  const uploadMutation = useMutation({
  mutationFn: ({ file, category }: { file: File; category: ArtifactCategory }) =>
    uploadArtifact(guidelineId, file, category),
  onSuccess: (newArtifact) => {
    queryClient.setQueryData<Artifact[]>(["artifacts", guidelineId], (prev) => [
      ...(prev ?? []),
      newArtifact,
    ]);
  },
  });

  const captionMutation = useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) =>
      fetch(`/api/guidelines/${guidelineId}/artifacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      }).then((res) => res.json()),
    onSuccess: (updated) => {
      queryClient.setQueryData<Artifact[]>(["artifacts", guidelineId], (prev) =>
        (prev ?? []).map((a) => (a.id === updated.id ? updated : a))
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/guidelines/${guidelineId}/artifacts/${id}`, { method: "DELETE" }),
    onSuccess: (_res, id) => {
      queryClient.setQueryData<Artifact[]>(["artifacts", guidelineId], (prev) =>
        (prev ?? []).filter((a) => a.id !== id)
      );
    },
  });

  return {
    artifacts: query.data ?? [],
    isLoading: query.isLoading,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    updateCaption: captionMutation.mutate,
    remove: removeMutation.mutate,
  };
}