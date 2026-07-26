"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactCategory } from "@/lib/artifacts";
import { ARTIFACT_CATEGORY_STYLES } from "@/lib/artifactCategoryStyles";

type CategoryFilter = ArtifactCategory | "all";

interface CategoryFilterTabsProps {
  active: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
}

const CATEGORY_ORDER: ArtifactCategory[] = [
  "figure",
  "table",
  "flowchart",
  "chart",
  "pdf",
];

export function CategoryFilterTabs({
  active,
  onChange,
}: CategoryFilterTabsProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(value) => onChange(value as CategoryFilter)}
    >
      <TabsList className="bg-muted/50">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-[#2F6B4F] data-[state=active]:text-white"
        >
          All
        </TabsTrigger>
        {CATEGORY_ORDER.map((cat) => (
          <TabsTrigger
            key={cat}
            value={cat}
            className="data-[state=active]:bg-[#2F6B4F] data-[state=active]:text-white"
          >
            {ARTIFACT_CATEGORY_STYLES[cat].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
