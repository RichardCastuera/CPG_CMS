// app/guidelines/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";

import { useReferences } from "@/lib/hooks/useReferences";
import { GuidelineTree, updateNodeField } from "@/lib/guidelineTree";
import { ArtifactsPanel } from "@/components/Editor/ArtifactsPanel";
import { EditorBreadcrumb } from "@/components/Editor/EditorBreadcrumb";
import { NodeEditorPanel } from "@/components/Editor/NodeEditorPanel";
import { ReferencesPanel } from "@/components/Editor/ReferencesPanel";
import { SidePanelTab, SidePanelTabs } from "@/components/Editor/SidePanelTabs";
import { GuidelineTreeView } from "@/components/Tree/GuidelineTreeView";
import { useAutosave, AutosaveStatus } from "@/lib/hooks/useAutoSave";
import { CommentsPanel } from "@/components/Editor/CommentsPanel";
import { useComments } from "@/lib/hooks/useComments";
import { GuidelineWithVersions } from "@/constants";
import { GuidelineInfoPanel } from "@/components/Guideline-Info/GuidelineInfoPanel";
import { useArtifacts } from "@/lib/hooks/useArtifacts";

async function fetchGuidelineInfo(
  guidelineId: string,
): Promise<GuidelineWithVersions> {
  const res = await fetch(`/api/guidelines/${guidelineId}/info`);
  if (!res.ok) throw new Error("Failed to load guideline info");
  return res.json();
}

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
  const [mainView, setMainView] = useState<"node" | "info">("node");

  // Guideline info now starts as null (loading) instead of a hardcoded blank
  // object — real data is fetched from the server, which is what the Create
  // Guideline form's submission actually populated.
  const [guidelineInfo, setGuidelineInfo] =
    useState<GuidelineWithVersions | null>(null);

  const { data: fetchedInfo } = useQuery({
    queryKey: ["guideline-info", guidelineId],
    queryFn: () => fetchGuidelineInfo(guidelineId),
  });

  // Sync fetched data into local editable state once it arrives.
  // Local state is what the form fields bind to and what autosave watches;
  // the query is only the initial-load source of truth, not re-synced after
  // that (otherwise a background refetch could stomp on unsaved local edits).
  useEffect(() => {
    if (fetchedInfo && !guidelineInfo) {
      setGuidelineInfo(fetchedInfo);
    }
  }, [fetchedInfo, guidelineInfo]);

  // Tree autosave
  const {
    status: treeStatus,
    lastSavedAt: treeLastSavedAt,
    flush: flushTree,
  } = useAutosave(tree, {
    save: (payload) =>
      fetch(`/api/guidelines/${guidelineId}/tree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });

  // Guideline info autosave — separate debounce/status, different payload/endpoint.
  // Guarded internally: no-ops until guidelineInfo has actually loaded, so we
  // never PUT a blank/incomplete object over real fetched data before it arrives.
  const {
    status: infoStatus,
    lastSavedAt: infoLastSavedAt,
    flush: flushInfo,
  } = useAutosave(guidelineInfo ?? ({} as GuidelineInfo), {
    save: (payload) => {
      if (!guidelineInfo) return Promise.resolve(new Response());
      return fetch(`/api/guidelines/${guidelineId}/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
  });

  // Combine both statuses into one indicator for the Navbar
  const combinedStatus: AutosaveStatus =
    treeStatus === "saving" || infoStatus === "saving"
      ? "saving"
      : treeStatus === "error" || infoStatus === "error"
        ? "error"
        : treeStatus === "saved" || infoStatus === "saved"
          ? "saved"
          : "idle";

  const combinedLastSavedAt =
    treeLastSavedAt && infoLastSavedAt
      ? new Date(Math.max(treeLastSavedAt.getTime(), infoLastSavedAt.getTime()))
      : (treeLastSavedAt ?? infoLastSavedAt);

  const artifactsData = useArtifacts(guidelineId);
  const referencesData = useReferences(guidelineId, referenceQuery);
  const commentsData = useComments(guidelineId, activeNodeId ?? "");

  function handleFieldChange(nodeId: string, field: string, value: string) {
    setTree((prev) => updateNodeField(prev, nodeId, field, value));
  }

  function handleInfoChange(field: keyof GuidelineWithVersions, value: any) {
    setGuidelineInfo((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  // Selecting a tree node switches back to node view
  function handleSelectNode(id: string) {
    setActiveNodeId(id);
    setMainView("node");
  }

  function handleVersionChange(versionId: string, field: string, value: any) {
    setGuidelineInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        versions: prev.versions.map((v) =>
          v.id === versionId ? { ...v, [field]: value } : v,
        ),
      };
    });
  }

  async function handlePublish() {
    await Promise.all([flushTree(), flushInfo()]);
    // publish API call goes here
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmitOrPublish() {
    await Promise.all([flushTree(), flushInfo()]); // ensure latest edits are saved first

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/guidelines/${guidelineId}/submit-or-publish`,
        {
          method: "POST",
        },
      );
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to submit/publish");
      }
      // Refetch guideline info so the updated status reflects immediately
      queryClient.invalidateQueries({
        queryKey: ["guideline-info", guidelineId],
      });
    } catch (err) {
      console.error(err);
      // TODO: surface a real error toast once you have one wired in
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        autosaveStatus={combinedStatus}
        lastSavedAt={combinedLastSavedAt}
        guidelineType={guidelineInfo?.guideline_type}
        onSubmitOrPublish={handleSubmitOrPublish}
        onOpenGuidelineInfo={() => setMainView("info")}
        isSubmitting={isSubmitting}
        publishDisabled={!guidelineInfo}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r bg-white">
          <GuidelineTreeView
            tree={tree}
            onChange={setTree}
            activeNodeId={activeNodeId}
            onSelectNode={handleSelectNode}
          />
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <EditorBreadcrumb
            tree={tree}
            activeNodeId={activeNodeId}
            autosaveStatus={combinedStatus}
            lastSavedAt={combinedLastSavedAt}
          />

          {mainView === "info" ? (
            guidelineInfo ? (
              <GuidelineInfoPanel
                info={guidelineInfo}
                onChange={handleInfoChange}
                onVersionChange={handleVersionChange}
              />
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                Loading guideline info...
              </p>
            )
          ) : (
            <NodeEditorPanel
              tree={tree}
              activeNodeId={activeNodeId}
              onFieldChange={handleFieldChange}
            />
          )}
        </main>

        <aside className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l bg-white">
          <SidePanelTabs
            active={sideTab}
            onChange={setSideTab}
            counts={{
              artifacts: artifactsData.artifacts.length,
              references: referencesData.attached.length,
              comments: commentsData.comments.filter((c) => !c.resolved).length,
            }}
          />
          <div className="min-h-0 flex-1">
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
                createAndAttach={referencesData.createAndAttach}
                isCreating={referencesData.isCreating}
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
          </div>
        </aside>
      </div>
    </div>
  );
}
