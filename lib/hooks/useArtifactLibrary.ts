"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArtifactCategory } from "@/lib/artifacts";

interface LibraryArtifact {
  id: string;
  name: string;
  category: ArtifactCategory;
  fileFormat: string;
  sizeLabel: string;
  guidelineVersionLabel: string;
  guidelineId: string;
}

interface UseArtifactLibraryOptions {
  guidelineId?: string;
  category?: ArtifactCategory | "all";
}

async function fetchAllArtifacts(): Promise<LibraryArtifact[]> {
  const res = await fetch(`/api/artifacts`);
  if (!res.ok) throw new Error("Failed to load artifact library");
  return res.json();
}

interface UseArtifactLibraryOptions {
  guidelineId?: string;
  category?: ArtifactCategory | "all";
  search?: string;
}

export function useArtifactLibrary({ guidelineId, category, search }: UseArtifactLibraryOptions) {
  const query = useQuery({
    queryKey: ["artifact-library"],
    queryFn: fetchAllArtifacts,
  });

  const items = useMemo(() => {
    let result = query.data ?? [];
    if (guidelineId) result = result.filter((a) => a.guidelineId === guidelineId);
    if (category && category !== "all") result = result.filter((a) => a.category === category);
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    return result;
  }, [query.data, guidelineId, category, search]);

  return {
    items,
    isLoading: query.isLoading,
    totalCount: items.length,
  };
}