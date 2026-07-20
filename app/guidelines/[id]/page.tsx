// app/guidelines/[id]/page.tsx
"use client";

import { use, useState } from "react";
import Navbar from "@/components/Navbar";

import { useArtifacts } from "@/lib/hooks/useArtifacts";
import { useReferences } from "@/lib/hooks/useReferences";
import { GuidelineTree, updateNodeField } from "@/lib/guidelineTree";
import { ArtifactsPanel } from "@/components/Editor/ArtifactsPanel";
import { EditorBreadcrumb } from "@/components/Editor/EditorBreadcrumb";
import { NodeEditorPanel } from "@/components/Editor/NodeEditorPanel";
import { ReferencesPanel } from "@/components/Editor/ReferencesPanel";
import { SidePanelTab, SidePanelTabs } from "@/components/Editor/SidePanelTabs";
import { GuidelineTreeView } from "@/components/Tree/GuidelineTreeView";
import { useAutosave } from "@/lib/hooks/useAutoSave";
import { CommentsPanel } from "@/components/Editor/CommentsPanel";
import { useComments } from "@/lib/hooks/useComments";

export default function GuidelineEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: guidelineId } = use(params);

  const [tree, setTree] = useState<GuidelineTree>({ sections: [] });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<SidePanelTab>("artifacts");
  const [referenceQuery, setReferenceQuery] = useState("");

  const { status, lastSavedAt, flush } = useAutosave(tree, { guidelineId });

  // Lifted here so both the tab counts and the panels share the same data —
  // previously each panel fetched independently, so the page never knew the counts.
  const artifactsData = useArtifacts(guidelineId);
  const referencesData = useReferences(guidelineId, referenceQuery);
  const commentsData = useComments(guidelineId, activeNodeId ?? "");

  function handleFieldChange(nodeId: string, field: string, value: string) {
    setTree((prev) => updateNodeField(prev, nodeId, field, value));
  }

  async function handlePublish() {
    await flush();
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        autosaveStatus={status}
        lastSavedAt={lastSavedAt}
        onPublish={handlePublish}
      />
      <EditorBreadcrumb
        tree={tree}
        activeNodeId={activeNodeId}
        autosaveStatus={status}
        lastSavedAt={lastSavedAt}
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
          <NodeEditorPanel
            tree={tree}
            activeNodeId={activeNodeId}
            onFieldChange={handleFieldChange}
          />
        </main>
        <aside className="w-80 shrink-0 overflow-y-auto border-l">
          <SidePanelTabs
            active={sideTab}
            onChange={setSideTab}
            counts={{
              artifacts: artifactsData.artifacts.length,
              references: referencesData.attached.length,
              comments: commentsData.comments.filter((c) => !c.resolved).length,
            }}
          />
          {sideTab === "artifacts" && (
            <ArtifactsPanel
              artifacts={artifactsData.artifacts}
              isLoading={artifactsData.isLoading}
              isUploading={artifactsData.isUploading}
              upload={artifactsData.upload}
              updateCaption={artifactsData.updateCaption}
              remove={artifactsData.remove}
            />
          )}
          {sideTab === "references" && (
            <ReferencesPanel
              attached={referencesData.attached}
              searchResults={referencesData.searchResults}
              isSearching={referencesData.isSearching}
              query={referenceQuery}
              onQueryChange={setReferenceQuery}
              attach={referencesData.attach}
              detach={referencesData.detach}
            />
          )}
          {sideTab === "comments" &&
            (activeNodeId ? (
              <CommentsPanel
                comments={commentsData.comments}
                isLoading={commentsData.isLoading}
                isAdding={commentsData.isAdding}
                addComment={commentsData.addComment}
                toggleResolved={commentsData.toggleResolved}
                deleteComment={commentsData.deleteComment}
              />
            ) : (
              <p className="p-3 text-xs text-muted-foreground">
                Select a section, question, or recommendation to view comments
              </p>
            ))}
        </aside>
      </div>
    </div>
  );
}
