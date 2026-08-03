"use client";

import { use, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import Navbar from "@/components/Navbar";

import { useReferences } from "@/lib/hooks/useReferences";
import {
  findNodeLocation,
  GuidelineTree,
  updateNodeField,
} from "@/lib/guidelineTree";
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
import { useSearchParams } from "next/navigation";

async function fetchGuidelineInfo(
  guidelineId: string,
): Promise<GuidelineWithVersions> {
  const res = await fetch(`/api/guidelines/${guidelineId}/info`);
  if (!res.ok) throw new Error("Failed to load guideline info");
  return res.json();
}

async function fetchGuidelineTree(
  guidelineId: string,
  versionId: string,
): Promise<GuidelineTree> {
  const res = await fetch(
    `/api/guidelines/${guidelineId}/versions/${versionId}/tree`,
  );
  if (!res.ok) throw new Error("Failed to load guideline tree");
  return res.json();
}

export default function GuidelineEditor({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id: guidelineId, versionId } = use(params);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [tree, setTree] = useState<GuidelineTree>({ sections: [] });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<SidePanelTab>("artifacts");
  const [referenceQuery, setReferenceQuery] = useState("");
  const [mainView, setMainView] = useState<"node" | "info">(
    searchParams.get("view") === "info" ? "info" : "node",
  );
  const activeNodeLoc = activeNodeId
    ? findNodeLocation(tree, activeNodeId)
    : null;
  const commentsData = useComments(
    guidelineId,
    activeNodeId ?? "",
    activeNodeLoc?.node.type ?? "section",
  );

  // Guideline info: local editable state, seeded once real data arrives.
  const [guidelineInfo, setGuidelineInfo] =
    useState<GuidelineWithVersions | null>(null);
  const [loadedInfoId, setLoadedInfoId] = useState<string | null>(null);

  const { data: fetchedInfo } = useQuery({
    queryKey: ["guideline-info", guidelineId],
    queryFn: () => fetchGuidelineInfo(guidelineId),
  });

  // Seed local state during render (React's supported pattern for "reset
  // state when a key changes") rather than in an effect — a background
  // refetch after this point must not stomp unsaved local edits.
  if (fetchedInfo && loadedInfoId !== guidelineId) {
    setLoadedInfoId(guidelineId);
    setGuidelineInfo(fetchedInfo);
  }

  // Tree: same pattern, keyed on guideline+version.
  const [loadedTreeKey, setLoadedTreeKey] = useState<string | null>(null);
  const treeKey = `${guidelineId}:${versionId}`;

  const { data: fetchedTree, isLoading: isTreeLoading } = useQuery({
    queryKey: ["guideline-tree", guidelineId, versionId],
    queryFn: () => fetchGuidelineTree(guidelineId, versionId),
  });

  if (fetchedTree && loadedTreeKey !== treeKey) {
    setLoadedTreeKey(treeKey);
    setTree(fetchedTree);
  }

  const treeLoaded = loadedTreeKey === treeKey;

  // Tree autosave
  const {
    status: treeStatus,
    lastSavedAt: treeLastSavedAt,
    flush: flushTree,
  } = useAutosave(tree, {
    enabled: treeLoaded,
    save: (payload) =>
      fetch(`/api/guidelines/${guidelineId}/versions/${versionId}/tree`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });

  // Guideline info autosave — separate debounce/status, different payload/endpoint.
  const {
    status: infoStatus,
    lastSavedAt: infoLastSavedAt,
    flush: flushInfo,
  } = useAutosave(guidelineInfo, {
    enabled: guidelineInfo !== null,
    save: (payload) =>
      fetch(`/api/guidelines/${guidelineId}/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
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

  function handleFieldChange(
    nodeId: string,
    field: string,
    value: string | JSONContent,
  ) {
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

  function handleVersionChange(
    targetVersionId: string,
    field: string,
    value: any,
  ) {
    setGuidelineInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        versions: prev.versions.map((v) =>
          v.id === targetVersionId ? { ...v, [field]: value } : v,
        ),
      };
    });
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  async function handleSubmitOrPublish() {
    await Promise.all([flushTree(), flushInfo()]);

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/guidelines/${guidelineId}/submit-or-publish`,
        { method: "POST" },
      );
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to submit/publish");
      }
      const fresh = await fetchGuidelineInfo(guidelineId);
      setGuidelineInfo(fresh);
      queryClient.setQueryData(["guideline-info", guidelineId], fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApproveVersion(targetVersionId: string) {
    setIsApproving(true);
    try {
      const res = await fetch(
        `/api/guidelines/${guidelineId}/versions/${targetVersionId}/approve`,
        { method: "POST" },
      );
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to approve version");
      }
      // Fetch fresh info directly and set it — this is a confirmed server
      // change, not a background refetch, so it should always win over
      // local state (unlike the initial-load sync, which must not clobber
      // unsaved edits).
      const fresh = await fetchGuidelineInfo(guidelineId);
      setGuidelineInfo(fresh);
      queryClient.setQueryData(["guideline-info", guidelineId], fresh);
    } catch (err) {
      console.error(err);
      // TODO: surface a real error toast once you have one wired in
    } finally {
      setIsApproving(false);
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
          {isTreeLoading ? (
            <p className="p-4 text-sm text-muted-foreground">
              Loading structure...
            </p>
          ) : (
            <GuidelineTreeView
              tree={tree}
              onChange={setTree}
              activeNodeId={activeNodeId}
              onSelectNode={handleSelectNode}
            />
          )}
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
                onApproveVersion={handleApproveVersion}
                isApproving={isApproving}
                editingVersionId={versionId}
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
              guidelineId={guidelineId}
            />
          )}
        </main>

        {mainView === "node" && (
          <aside className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l bg-white">
            <SidePanelTabs
              active={sideTab}
              onChange={setSideTab}
              counts={{
                artifacts: artifactsData.artifacts.length,
                references: referencesData.attached.length,
                comments: commentsData.comments.filter((c) => !c.resolved)
                  .length,
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
                    Select a section, question, or recommendation to view
                    comments
                  </p>
                ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
