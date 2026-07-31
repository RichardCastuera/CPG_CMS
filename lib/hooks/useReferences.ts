// lib/hooks/useReferences.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { AttachedReference, Reference } from "@/lib/references";
import { NewReferenceInput } from "../references";

async function fetchAttached(guidelineId: string): Promise<AttachedReference[]> {
  const res = await fetch(`/api/guidelines/${guidelineId}/references`);
  if (!res.ok) throw new Error("Failed to load references");
  return res.json();
}

async function searchCitations(query: string): Promise<Reference[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/references/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useReferences(guidelineId: string, query: string) {
  const queryClient = useQueryClient();
  const [debouncedQuery] = useDebounce(query, 300);

  const attachedQuery = useQuery({
    queryKey: ["references", guidelineId],
    queryFn: () => fetchAttached(guidelineId),
  });

  const searchQuery = useQuery({
    queryKey: ["citation-search", debouncedQuery],
    queryFn: () => searchCitations(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const attachMutation = useMutation({
    mutationFn: (referenceId: string) =>
      fetch(`/api/guidelines/${guidelineId}/references`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references", guidelineId] });
    },
  });

  const detachMutation = useMutation({
    mutationFn: (referenceId: string) =>
      fetch(`/api/guidelines/${guidelineId}/references/${referenceId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references", guidelineId] });
    },
  });

  const createMutation = useMutation({
  mutationFn: (input: NewReferenceInput) =>
    fetch(`/api/guidelines/${guidelineId}/references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newReference: input }), // distinguishes "create new" from "attach existing by id"
    }).then((res) => res.json()),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["references", guidelineId] });
  },
});

return {
  attached: attachedQuery.data ?? [],
  searchResults: searchQuery.data ?? [],
  isSearching: searchQuery.isFetching,
  attach: attachMutation.mutate,
  detach: detachMutation.mutate,
  createAndAttach: createMutation.mutate,
  isCreating: createMutation.isPending,
};
}