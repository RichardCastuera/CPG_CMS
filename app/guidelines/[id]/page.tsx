// app/guidelines/[id]/page.tsx
"use client";

import { use, useState } from "react";
import Navbar from "@/components/Navbar";

import { GuidelineTree } from "@/lib/guidelineTree";
import { useAutosave } from "@/lib/hooks/useAutoSave";
import { GuidelineTreeView } from "@/components/Tree/GuidelineTreeView";

export default function GuidelineEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: guidelineId } = use(params);

  // Placeholder tree until this is wired to a real fetch
  const [tree, setTree] = useState<GuidelineTree>({ sections: [] });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const { status, lastSavedAt, flush } = useAutosave(tree, { guidelineId });

  async function handlePublish() {
    await flush();
    // publish API call goes here
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        autosaveStatus={status}
        lastSavedAt={lastSavedAt}
        onPublish={handlePublish}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r">
          <GuidelineTreeView
            tree={tree}
            onChange={setTree}
            activeNodeId={activeNodeId}
            onSelectNode={setActiveNodeId}
          />
        </aside>
        <main className="flex-1 overflow-y-auto">
          {/* Section/Question/Recommendation editor panel, driven by activeNodeId */}
        </main>
      </div>
    </div>
  );
}
