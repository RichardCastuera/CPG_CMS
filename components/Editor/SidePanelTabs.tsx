"use client";

import { cn } from "@/lib/utils";

export type SidePanelTab = "artifacts" | "references" | "comments";

interface SidePanelTabsProps {
  active: SidePanelTab;
  onChange: (tab: SidePanelTab) => void;
  counts: { artifacts: number; references: number; comments: number };
}

export function SidePanelTabs({
  active,
  onChange,
  counts,
}: SidePanelTabsProps) {
  const tabs: { key: SidePanelTab; label: string; count: number }[] = [
    { key: "artifacts", label: "Artifacts", count: counts.artifacts },
    { key: "references", label: "References", count: counts.references },
    { key: "comments", label: "Comments", count: counts.comments },
  ];

  return (
    <div className="flex border-b px-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "border-b-2 px-3 py-2 text-xs font-medium transition-colors",
            active === tab.key
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
