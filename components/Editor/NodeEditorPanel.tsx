"use client";

import { AnyNode, findNodeLocation, GuidelineTree } from "@/lib/guidelineTree";
import { RichTextEditor } from "./RichTextEditor";
import { RecommendationMetaFields } from "./RecommendationsMetaFields";
import { Card } from "../ui/card";

interface NodeEditorPanelProps {
  tree: GuidelineTree;
  activeNodeId: string | null;
  onFieldChange: (nodeId: string, field: string, value: string) => void;
}

export function NodeEditorPanel({
  tree,
  activeNodeId,
  onFieldChange,
}: NodeEditorPanelProps) {
  if (!activeNodeId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select an item from the tree to edit it
      </div>
    );
  }

  const loc = findNodeLocation(tree, activeNodeId);
  if (!loc) return null;
  const node = loc.node;

  if (node.type === "section") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h2>Guideline Title</h2>
        <Card className="px-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Section Title
            </label>
            <input
              value={node.title}
              onChange={(e) => onFieldChange(node.id, "title", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Overview</label>
            <RichTextEditor
              content={node.overview ?? ""}
              onChange={(html) => onFieldChange(node.id, "overview", html)}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (node.type === "question") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h2>Guideline Title</h2>
        <Card className="px-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Clinical Question
            </label>
            <input
              value={node.clinicalQuestion ?? ""}
              onChange={(e) =>
                onFieldChange(node.id, "clinicalQuestion", e.target.value)
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Background</label>
            <RichTextEditor
              content={node.background ?? ""}
              onChange={(html) => onFieldChange(node.id, "background", html)}
            />
          </div>
        </Card>
      </div>
    );
  }

  // recommendation
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h2>Guideline Title</h2>
      <Card className="px-6">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Recommendation Title
          </label>
          <input
            value={node.title}
            onChange={(e) => onFieldChange(node.id, "title", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Number</label>
            <input
              value={node.number}
              onChange={(e) => onFieldChange(node.id, "number", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <RecommendationMetaFields
          strength={(node.strength as any) ?? "Strong"}
          certainty={(node.certaintyOfEvidence as any) ?? "Moderate"}
          onStrengthChange={(value) =>
            onFieldChange(node.id, "strength", value)
          }
          onCertaintyChange={(value) =>
            onFieldChange(node.id, "certaintyOfEvidence", value)
          }
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Statement</label>
          <RichTextEditor
            content={node.statement ?? ""}
            onChange={(html) => onFieldChange(node.id, "statement", html)}
          />
        </div>
      </Card>
    </div>
  );
}
