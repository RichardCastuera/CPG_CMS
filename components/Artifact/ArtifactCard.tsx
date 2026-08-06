"use client";

import { ARTIFACT_CATEGORY_STYLES } from "@/lib/artifactCategoryStyles";
import { ArtifactCategory } from "@/lib/artifacts";
import { Link2, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ArtifactCardProps {
  name: string;
  category: ArtifactCategory;
  fileFormat: string;
  sizeLabel: string;
  guidelineVersionLabel: string;
  guidelineId?: string | null;
  thumbnailUrl?: string | null;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onPreview?: () => void;
  onDelete?: () => void;
}

export function ArtifactCard({
  name,
  category,
  fileFormat,
  sizeLabel,
  guidelineVersionLabel,
  guidelineId,
  thumbnailUrl,
  selected = false,
  onSelectChange,
  onPreview,
  onDelete,
}: ArtifactCardProps) {
  const style = ARTIFACT_CATEGORY_STYLES[category];
  const Icon = style.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <div className="absolute left-2 top-2 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelectChange?.(!!v)}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5 border-2 border-white bg-white/90 shadow-sm data-[state=checked]:border-[#2F6B4F] data-[state=checked]:bg-[#2F6B4F]"
          aria-label={`Select ${name}`}
        />
      </div>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 bg-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPreview}>
              <Eye size={14} className="mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        onClick={onPreview}
        className="flex h-32 items-center justify-center text-left"
        style={{ width: "100%" }}
      >
        <div
          className={`flex h-full w-full items-center justify-center ${style.bgClass}`}
        >
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon size={36} className={style.iconClass} strokeWidth={1.75} />
          )}
        </div>
      </button>

      <button onClick={onPreview} className="space-y-1 p-3 text-left">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          {style.label} · {fileFormat} · {sizeLabel}
        </p>
        {guidelineId ? (
          <a
            href={`/guidelines/${guidelineId}/versions`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            <Link2 size={10} />
            {guidelineVersionLabel}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
            <Link2 size={10} />
            {guidelineVersionLabel}
          </span>
        )}
      </button>
    </div>
  );
}
