"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  GuidelineTree,
  moveNode,
  findNodeLocation,
  AnyNode,
  deleteNode,
  duplicateNode,
  renameNode,
  addChild,
  moveAdjacent,
} from "@/lib/guidelineTree";
import { SortableRow } from "./SortableRow";
import { NodeContextMenu } from "./NodeContextMenu";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface GuidelineTreeViewProps {
  tree: GuidelineTree;
  onChange: (tree: GuidelineTree) => void;
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
}

// --- TreeRow lives OUTSIDE GuidelineTreeView ---
// Defining it inside the parent component would recreate the function on
// every render, breaking React's reconciliation (lost input focus on
// rename, potential drag glitches). It's a plain, stateless row renderer.

interface TreeRowProps {
  node: AnyNode;
  depth: number;
  active: boolean;
  renaming: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelect: () => void;
  onStartRename: () => void;
  onSubmitRename: (title: string) => void;
  onAddChild?: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function TreeRow({
  node,
  depth,
  active,
  renaming,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onSelect,
  onStartRename,
  onSubmitRename,
  onAddChild,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: TreeRowProps) {
  const dotColor =
    node.status === "complete"
      ? "bg-green-500"
      : node.status === "needs-review"
        ? "bg-orange-400"
        : "bg-gray-300";

  return (
    <SortableRow
      id={node.id}
      depth={depth}
      hasChildren={hasChildren}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {renaming ? (
        <input
          autoFocus
          defaultValue={node.title}
          onBlur={(e) => onSubmitRename(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              onSubmitRename((e.target as HTMLInputElement).value);
            if (e.key === "Escape") onSubmitRename(node.title); // revert
          }}
          className="flex-1 rounded border px-2 py-1 text-sm"
        />
      ) : (
        <button
          onClick={onSelect}
          onDoubleClick={onStartRename}
          className={`flex flex-1 items-center justify-between truncate rounded-md px-2 py-1 text-sm ${
            active ? "bg-[#2F6B4F] text-white" : "hover:bg-muted"
          }`}
        >
          <span className="truncate">{node.title}</span>
          <span className={`ml-2 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
        </button>
      )}
      <NodeContextMenu
        node={node}
        onAddChild={onAddChild}
        onRename={onStartRename}
        onDuplicate={onDuplicate}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
      />
    </SortableRow>
  );
}

export function GuidelineTreeView({
  tree,
  onChange,
  activeNodeId,
  onSelectNode,
}: GuidelineTreeViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const [draggingNode, setDraggingNode] = useState<AnyNode | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // REPLACES allIds — must exclude hidden children or dnd-kit's drop targeting breaks
  const visibleIds: string[] = [];
  for (const section of tree.sections) {
    visibleIds.push(section.id);
    if (collapsedIds.has(section.id)) continue;
    for (const question of section.children) {
      visibleIds.push(question.id);
      if (collapsedIds.has(question.id)) continue;
      for (const rec of question.children) {
        visibleIds.push(rec.id);
      }
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const loc = findNodeLocation(tree, String(event.active.id));
    setDraggingNode(loc?.node ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingNode(null);
    if (!over || active.id === over.id) return;
    const updated = moveNode(tree, String(active.id), String(over.id));
    onChange(updated);
  }

  function handleDragCancel() {
    setDraggingNode(null);
  }

  function handleAddChild(parentId: string) {
    onChange(addChild(tree, parentId));
  }

  function handleRename(id: string, newTitle: string) {
    onChange(renameNode(tree, id, newTitle));
    setRenamingId(null);
  }

  function handleDuplicate(id: string) {
    onChange(duplicateNode(tree, id));
  }

  function handleDelete(id: string) {
    if (confirm("Delete this item and everything under it?")) {
      onChange(deleteNode(tree, id));
    }
  }

  function handleMove(id: string, direction: "up" | "down") {
    onChange(moveAdjacent(tree, id, direction));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex items-center justify-between mx-6 my-2">
        <div className="flex flex-col">
          <h4>Guideline</h4>
          <p>Content Structure</p>
        </div>
        <Button
          variant={"outline"}
          onClick={() => handleAddChild("root")}
          className="text-sm font-medium hover:text-white hover:bg-[#2F6B4F]"
        >
          <Plus size={24} />
        </Button>
      </div>
      <hr />
      {tree.sections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No sections yet</p>
        </div>
      ) : (
        <SortableContext
          items={visibleIds}
          strategy={verticalListSortingStrategy}
        >
          {tree.sections.map((section) => {
            const sectionExpanded = !collapsedIds.has(section.id);
            return (
              <div key={section.id}>
                <TreeRow
                  node={section}
                  depth={0}
                  active={activeNodeId === section.id}
                  renaming={renamingId === section.id}
                  hasChildren={section.children.length > 0}
                  isExpanded={sectionExpanded}
                  onToggleExpand={() => toggleExpand(section.id)}
                  onSelect={() => onSelectNode(section.id)}
                  onStartRename={() => setRenamingId(section.id)}
                  onSubmitRename={(title) => handleRename(section.id, title)}
                  onAddChild={() => handleAddChild(section.id)}
                  onDuplicate={() => handleDuplicate(section.id)}
                  onMoveUp={() => handleMove(section.id, "up")}
                  onMoveDown={() => handleMove(section.id, "down")}
                  onDelete={() => handleDelete(section.id)}
                />

                {sectionExpanded &&
                  section.children.map((question) => {
                    const questionExpanded = !collapsedIds.has(question.id);
                    return (
                      <div key={question.id}>
                        <TreeRow
                          node={question}
                          depth={1}
                          active={activeNodeId === question.id}
                          renaming={renamingId === question.id}
                          hasChildren={question.children.length > 0}
                          isExpanded={questionExpanded}
                          onToggleExpand={() => toggleExpand(question.id)}
                          onSelect={() => onSelectNode(question.id)}
                          onStartRename={() => setRenamingId(question.id)}
                          onSubmitRename={(title) =>
                            handleRename(question.id, title)
                          }
                          onAddChild={() => handleAddChild(question.id)}
                          onDuplicate={() => handleDuplicate(question.id)}
                          onMoveUp={() => handleMove(question.id, "up")}
                          onMoveDown={() => handleMove(question.id, "down")}
                          onDelete={() => handleDelete(question.id)}
                        />

                        {questionExpanded &&
                          question.children.map((rec) => (
                            <TreeRow
                              key={rec.id}
                              node={rec}
                              depth={2}
                              active={activeNodeId === rec.id}
                              renaming={renamingId === rec.id}
                              onSelect={() => onSelectNode(rec.id)}
                              onStartRename={() => setRenamingId(rec.id)}
                              onSubmitRename={(title) =>
                                handleRename(rec.id, title)
                              }
                              onDuplicate={() => handleDuplicate(rec.id)}
                              onMoveUp={() => handleMove(rec.id, "up")}
                              onMoveDown={() => handleMove(rec.id, "down")}
                              onDelete={() => handleDelete(rec.id)}
                            />
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </SortableContext>
      )}

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
        {draggingNode ? <DragGhost node={draggingNode} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragGhost({ node }: { node: AnyNode }) {
  const dotColor =
    node.status === "complete"
      ? "bg-green-500"
      : node.status === "needs-review"
        ? "bg-orange-400"
        : "bg-gray-300";

  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 shadow-lg">
      <span className="truncate text-sm font-medium">{node.title}</span>
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
    </div>
  );
}
