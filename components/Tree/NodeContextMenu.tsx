"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { AnyNode } from "@/lib/guidelineTree";

interface NodeContextMenuProps {
  node: AnyNode;
  onAddChild?: () => void; // omit prop entirely to hide "Add ___" (e.g. for recommendations)
  onRename: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const ADD_LABEL: Record<AnyNode["type"], string> = {
  section: "Add question",
  question: "Add recommendation",
  recommendation: "", // unused — recommendations have no children
};

export function NodeContextMenu({
  node,
  onAddChild,
  onRename,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: NodeContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
          className="rounded p-1 opacity-0 hover:bg-muted group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()} // don't trigger row selection
        >
          <MoreVertical size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {onAddChild && (
          <>
            <DropdownMenuItem
              className="font-medium text-[#2F6B4F] focus:text-[#2F6B4F]"
              onClick={onAddChild}
            >
              {ADD_LABEL[node.type]}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMoveUp}>Move up</DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveDown}>Move down</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
