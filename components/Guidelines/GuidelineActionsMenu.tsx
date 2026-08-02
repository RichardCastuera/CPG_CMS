"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  GitBranch,
  FolderOpen,
  Archive,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { GuidelineWithVersions } from "@/constants";

interface GuidelineActionsMenuProps {
  guideline: GuidelineWithVersions;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onForcePublish?: (id: string) => void;
}

export function GuidelineActionsMenu({
  guideline,
  onArchive,
  onDelete,
  onForcePublish,
}: GuidelineActionsMenuProps) {
  const router = useRouter();

  function handleDelete() {
    if (confirm(`Delete "${guideline.title}"? This cannot be undone.`)) {
      onDelete?.(guideline.id);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal size={16} />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/guidelines/${guideline.id}`)}
        >
          <FolderOpen size={14} className="mr-2" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/guidelines/${guideline.id}/versions`)}
        >
          <GitBranch size={14} className="mr-2" />
          Versions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onForcePublish?.(guideline.id)}>
          <ShieldCheck size={14} className="mr-2" />
          Force publish (admin)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onArchive?.(guideline.id)}>
          <Archive size={14} className="mr-2" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
