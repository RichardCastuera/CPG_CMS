// components/artifacts/ArtifactCard.tsx
import { ARTIFACT_CATEGORY_STYLES } from "@/lib/artifactCategoryStyles";
import { ArtifactCategory } from "@/lib/artifacts";
import { Link2 } from "lucide-react";


interface ArtifactCardProps {
  name: string;
  category: ArtifactCategory;
  fileFormat: string; // "JPG", "PDF", etc — display label, separate from mimeType
  sizeLabel: string; // pre-formatted, e.g. "1.4 MB"
  guidelineVersionLabel: string; // "cpg v1.0"
  thumbnailUrl?: string; // if present, show real image instead of icon block
  onClick?: () => void;
}

export function ArtifactCard({
  name,
  category,
  fileFormat,
  sizeLabel,
  guidelineVersionLabel,
  thumbnailUrl,
  onClick,
}: ArtifactCardProps) {
  const style = ARTIFACT_CATEGORY_STYLES[category];
  const Icon = style.icon;

  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md"
    >
      <div className={`flex h-32 items-center justify-center ${style.bgClass}`}>
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

      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          {style.label} · {fileFormat} · {sizeLabel}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
          <Link2 size={10} />
          {guidelineVersionLabel}
        </span>
      </div>
    </button>
  );
}
