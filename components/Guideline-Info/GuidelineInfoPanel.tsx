"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TagInput } from "./TagInput";
import { AuthorsList } from "./AuthorsList";
import { DatePickerField } from "./DatePickerField";
import {
  GuidelineWithVersions,
  GuidelineStatus,
  VersionStatus,
  GuidelineType,
} from "@/constants";

interface GuidelineInfoPanelProps {
  info: GuidelineWithVersions;
  onChange: (field: keyof GuidelineWithVersions, value: any) => void;
  onVersionChange: (versionId: string, field: string, value: any) => void;
}

const STATUS_LABELS: Record<GuidelineStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
};

const STATUS_BADGE_STYLES: Record<GuidelineStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-500",
};

export function GuidelineInfoPanel({
  info,
  onChange,
  onVersionChange,
}: GuidelineInfoPanelProps) {
  const currentVersion =
    info.versions.find((v) => v.id === info.current_version_id) ??
    info.versions[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Guideline information</h2>
        <p className="text-sm text-muted-foreground">
          Publication-level metadata. Version history is managed separately.
        </p>
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <Input
            value={info.title}
            onChange={(e) => onChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <Select
              value={info.guideline_type}
              onValueChange={(v) =>
                onChange("guideline_type", v as GuidelineType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compendium">Compendium</SelectItem>
                <SelectItem value="Interim">Interim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <div className="flex items-center gap-2">
              <Select
                value={info.status}
                onValueChange={(v) => onChange("status", v as GuidelineStatus)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as GuidelineStatus[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_STYLES[info.status]}`}
              >
                {STATUS_LABELS[info.status]}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Publishing societies
          </label>
          <TagInput
            tags={info.societies}
            onChange={(tags) => onChange("societies", tags)}
            placeholder="Add society..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Specialty / topic tags
          </label>
          <TagInput
            tags={info.specialty_tags}
            onChange={(tags) => onChange("specialty_tags", tags)}
            placeholder="Add tag..."
          />
        </div>
      </div>

      {currentVersion && (
        <div className="space-y-4 rounded-md border p-4">
          <div>
            <h3 className="text-sm font-semibold">Current version</h3>
            <p className="text-xs text-muted-foreground">
              Editing {currentVersion.version_number}. Older versions are
              read-only here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Version number
              </label>
              <Input
                value={currentVersion.version_number}
                onChange={(e) =>
                  onVersionChange(
                    currentVersion.id,
                    "version_number",
                    e.target.value,
                  )
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Version status
              </label>
              <Select
                value={currentVersion.status}
                onValueChange={(v) =>
                  onVersionChange(
                    currentVersion.id,
                    "status",
                    v as VersionStatus,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="superseded">Superseded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Effective date
            </label>
            <DatePickerField
              value={currentVersion.effective_date ?? ""}
              onChange={(date) =>
                onVersionChange(currentVersion.id, "effective_date", date)
              }
            />
          </div>
        </div>
      )}

      <AuthorsList
        authors={info.authors}
        onChange={(authors) => onChange("authors", authors)}
      />
    </div>
  );
}
