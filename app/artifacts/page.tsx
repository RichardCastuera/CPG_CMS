"use client";

import { useState } from "react";
import { Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useArtifactLibrary } from "@/lib/hooks/useArtifactLibrary";
import { ArtifactCategory } from "@/lib/artifacts";
import { useDebounce } from "use-debounce";
import { ArtifactCard } from "@/components/Artifact/ArtifactCard";
import { CategoryFilterTabs } from "@/components/Artifact/CaegoryFilterTabs";

type CategoryFilter = ArtifactCategory | "all";

export default function ArtifactLibraryPage() {
  const [guidelineId, setGuidelineId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 250);

  const { items, isLoading, totalCount } = useArtifactLibrary({
    guidelineId,
    category,
    search,
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Artifact Library</h1>
        <p className="text-sm text-muted-foreground">
          Manage your clinical practice guidelines.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search artifacts..."
              className="w-64 pl-9"
            />
          </div>
          <Button className="gap-2 bg-[#2F6B4F] hover:bg-[#255d40]">
            <Upload size={16} />
            Upload file
          </Button>
        </div>
      </div>

      <CategoryFilterTabs active={category} onChange={setCategory} />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading artifacts...
        </p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No artifacts match this search
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <ArtifactCard
              key={item.id}
              name={item.name}
              category={item.category}
              fileFormat={item.fileFormat}
              sizeLabel={item.sizeLabel}
              guidelineVersionLabel={item.guidelineVersionLabel}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{totalCount} artifact(s)</p>
    </div>
  );
}
