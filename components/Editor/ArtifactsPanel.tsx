"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Artifact, ArtifactCategory } from "@/lib/artifacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  isLoading: boolean;
  isUploading: boolean;
  upload: (args: { file: File; category: ArtifactCategory }) => void;
  updateCaption: (args: { id: string; caption: string }) => void;
  remove: (id: string) => void;
}

const CATEGORY_LABELS: Record<ArtifactCategory, string> = {
  figure: "Figure",
  table: "Table",
  flowchart: "Flowchart",
  chart: "Chart",
  pdf: "PDF",
};

export function ArtifactsPanel({
  artifacts,
  isLoading,
  isUploading,
  upload,
  updateCaption,
  remove,
}: ArtifactsPanelProps) {
  const [category, setCategory] = useState<ArtifactCategory>("figure");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => upload({ file, category }));
    },
    [upload, category],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/svg+xml": [".svg"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
    noClick: true,
  });

  return (
    <div className="space-y-3 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Category for next upload
        </label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as ArtifactCategory)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CATEGORY_LABELS) as ArtifactCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragActive ? "border-emerald-600 bg-emerald-50" : "border-border",
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud size={20} className="text-emerald-700" />
        )}
        <p className="text-xs">
          <span className="font-medium text-emerald-700">
            Drop a figure or table here
          </span>
          <br />
          <span className="text-muted-foreground">
            PNG, JPG, SVG, PDF, or CSV
          </span>
        </p>
        <button
          type="button"
          onClick={open}
          className="mt-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Add artifact
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-xs text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {artifacts.map((artifact) => (
            <ArtifactRow
              key={artifact.id}
              artifact={artifact}
              onCaptionChange={(caption) =>
                updateCaption({ id: artifact.id, caption })
              }
              onRemove={() => remove(artifact.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArtifactRow({
  artifact,
  onCaptionChange,
  onRemove,
}: {
  artifact: Artifact;
  onCaptionChange: (caption: string) => void;
  onRemove: () => void;
}) {
  const [caption, setCaption] = useState(artifact.caption ?? "");

  return (
    <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-2">
      <FileText size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-emerald-700">
            {artifact.name}
          </p>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {CATEGORY_LABELS[artifact.category ?? "figure"]}
          </span>
        </div>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => onCaptionChange(caption)}
          placeholder="Add a caption"
          className="w-full truncate bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 hover:bg-muted"
      >
        <X size={14} />
      </button>
    </div>
  );
}
