"use client";

import { ChevronRight, PanelLeft } from "lucide-react";
import { AnyNode, findNodeLocation, GuidelineTree } from "@/lib/guidelineTree";
import { AutosaveStatus } from "@/lib/hooks/useAutoSave";

interface EditorBreadcrumbProps {
  tree: GuidelineTree;
  activeNodeId: string | null;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  editedByLabel?: string; // "You", or another user's name for collaborative editing
}

export function EditorBreadcrumb({
  tree,
  activeNodeId,
  autosaveStatus,
  lastSavedAt,
  editedByLabel = "You",
}: EditorBreadcrumbProps) {
  const path = activeNodeId ? getAncestorPath(tree, activeNodeId) : [];

  const statusLabel =
    autosaveStatus === "saving"
      ? "Saving..."
      : autosaveStatus === "saved"
        ? lastSavedAt
          ? `Saved ${formatRelative(lastSavedAt)}`
          : "Saved"
        : autosaveStatus === "error"
          ? "Failed to save"
          : null;

  return (
    <div className="flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground mx-2">
      <div className="flex items-center gap-1.5">
        <PanelLeft size={14} />
        <span>Last edited by {editedByLabel}</span>
        <span>·</span>
        <span>just now</span>
        <span>·</span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
          Edited
        </span>
      </div>

      <div className="flex items-center gap-1">
        {path.map((node, i) => (
          <span key={node.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} />}
            <span
              className={
                i === path.length - 1 ? "font-medium text-foreground" : ""
              }
            >
              {node.title}
            </span>
          </span>
        ))}
      </div>

      {statusLabel && (
        <span className={autosaveStatus === "error" ? "text-destructive" : ""}>
          {statusLabel === "Saving..." ? statusLabel : `✓ ${statusLabel}`}
        </span>
      )}
    </div>
  );
}

function getAncestorPath(tree: GuidelineTree, nodeId: string): AnyNode[] {
  for (const section of tree.sections) {
    if (section.id === nodeId) return [section];
    for (const question of section.children) {
      if (question.id === nodeId) return [section, question];
      for (const rec of question.children) {
        if (rec.id === nodeId) return [section, question, rec];
      }
    }
  }
  return [];
}

function formatRelative(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
