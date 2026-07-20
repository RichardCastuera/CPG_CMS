// components/tree/SortableRow.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  depth: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function SortableRow({
  id,
  children,
  depth,
  hasChildren = false,
  isExpanded = true,
  onToggleExpand,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, paddingLeft: depth * 16 }}
      className={cn(
        "group flex items-center gap-1 rounded-md py-1 pr-2",
        isDragging && "opacity-50",
      )}
    >
      {hasChildren ? (
        <button
          onClick={onToggleExpand}
          className="shrink-0 rounded p-0.5 hover:bg-muted"
        >
          <ChevronRight
            size={14}
            className={cn("transition-transform", isExpanded && "rotate-90")}
          />
        </button>
      ) : (
        <span className="w-[19px] shrink-0" />
      )}

      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none opacity-0 group-hover:opacity-60 active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </button>
      {children}
    </div>
  );
}
