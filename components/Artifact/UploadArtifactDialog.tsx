"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ArtifactCategory } from "@/lib/artifacts";
import { ARTIFACT_CATEGORY_STYLES } from "@/lib/artifactCategoryStyles";
import { GuidelineWithVersions } from "@/constants";

const UPLOADABLE_CATEGORIES: ArtifactCategory[] = [
  "figure",
  "table",
  "flowchart",
  "chart",
];

async function fetchGuidelines(): Promise<GuidelineWithVersions[]> {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  return res.json();
}

interface UploadArtifactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (args: {
    name: string;
    category: ArtifactCategory;
    file: File;
    guidelineId: string;
  }) => void;
  isUploading?: boolean;
}

export function UploadArtifactDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
}: UploadArtifactDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ArtifactCategory>("figure");
  const [guidelineId, setGuidelineId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const { data: guidelines, isLoading: guidelinesLoading } = useQuery({
    queryKey: ["guidelines-list"],
    queryFn: fetchGuidelines,
    enabled: open, // only fetch once the dialog is actually opened
  });

  function reset() {
    setName("");
    setCategory("figure");
    setGuidelineId("");
    setFile(null);
  }

  function handleUpload() {
    if (!name.trim() || !file || !guidelineId) return;
    onUpload({ name: name.trim(), category, file, guidelineId });
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  const canUpload = Boolean(name.trim() && file && guidelineId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upload artifact
          </DialogTitle>
          <DialogDescription>
            Add a figure, table, flowchart, or chart to the shared library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Guideline <span className="text-destructive">*</span>
            </label>
            <Select value={guidelineId} onValueChange={setGuidelineId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a guideline" />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {guidelinesLoading && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Loading...
                  </div>
                )}
                {guidelines?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pediatric CAP triage algorithm"
              className="focus-visible:ring-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kind</label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ArtifactCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {ARTIFACT_CATEGORY_STYLES[category].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {UPLOADABLE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {ARTIFACT_CATEGORY_STYLES[cat].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">File</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  document.getElementById("artifact-file-input")?.click()
                }
              >
                <Upload size={16} />
                Choose file
              </Button>
              <input
                id="artifact-file-input"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,application/pdf,text/csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="truncate text-sm text-muted-foreground">
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload || isUploading}
            className="bg-[#2F6B4F] hover:bg-[#255d40]"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
