"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompare,
  Plus,
  FileText,
  Eye,
  Copy,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GuidelineWithVersions,
  GuidelineVersion,
  VersionStatus,
} from "@/constants";

async function fetchGuidelineInfo(
  guidelineId: string,
): Promise<GuidelineWithVersions> {
  const res = await fetch(`/api/guidelines/${guidelineId}/info`);
  if (!res.ok) throw new Error("Failed to load guideline");
  return res.json();
}

const STATUS_BADGE_STYLES: Record<VersionStatus, string> = {
  draft: "bg-amber-100 text-amber-800",
  in_review: "bg-blue-100 text-blue-800",
  published: "bg-emerald-100 text-emerald-800",
  superseded: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<VersionStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  superseded: "Superseded",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function GuidelineVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: guidelineId } = use(params);

  const { data: guideline, isLoading } = useQuery({
    queryKey: ["guideline-info", guidelineId],
    queryFn: () => fetchGuidelineInfo(guidelineId),
  });

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Loading versions...</p>
    );
  }

  if (!guideline) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Guideline not found.</p>
    );
  }

  // Newest first — sort by created_at descending
  const sortedVersions = [...guideline.versions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link
        href="/guidelines"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to CPG library
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{guideline.title}</h1>
          <p className="text-sm text-muted-foreground">
            {guideline.societies.join(" · ")} · {guideline.versions.length}{" "}
            tracked versions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <GitCompare size={16} />
            Compare versions
          </Button>
          <Button className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90">
            <Plus size={16} />
            New version
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Version timeline</h2>
          <p className="text-xs text-muted-foreground">
            Newest first. Only versions marked{" "}
            <span className="font-medium">Active</span> are served to end users.
          </p>
        </div>

        <div>
          {sortedVersions.map((version, i) => {
            const isActive = version.id === guideline.current_version_id;
            return (
              <div key={version.id} className={i > 0 ? "border-t p-4" : "p-4"}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : version.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <span className="font-semibold">
                      {version.version_number}
                    </span>
                    {version.changelog && (
                      <span className="text-sm text-muted-foreground">
                        · {version.changelog.split(";")[0].slice(0, 40)}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : STATUS_BADGE_STYLES[version.status]
                      }`}
                    >
                      {isActive ? "Active" : STATUS_LABELS[version.status]}
                    </span>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {initials(version.created_by)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Published:{" "}
                    {version.published_at
                      ? formatDate(version.published_at)
                      : formatDate(version.effective_date)}
                  </span>
                  {version.source_pdf_url && <span>Source attached</span>}
                  {version.changelog && (
                    <span>DOI: {guideline.doi ?? "—"}</span>
                  )}
                  <span>Owner: {version.created_by ?? "Unknown"}</span>
                </div>

                {version.changelog && (
                  <div className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium">Changes:</span>{" "}
                    {version.changelog}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <Link
                    href={`/guidelines/${guideline.id}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <FileText size={14} />
                    Open
                  </Link>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Eye size={14} />
                    Preview
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Copy size={14} />
                    Duplicate as new
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Download size={14} />
                    Export
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mark as active</DropdownMenuItem>
                      <DropdownMenuItem>Rename version</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Delete version
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
