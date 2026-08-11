"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionFormDialog } from "@/components/VersionFormDialog";
import { GuidelineWithVersions, VersionStatus } from "@/constants";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingBar } from "@/components/ui/loading-bar";

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

function VersionRowSkeleton({ isFirst }: { isFirst: boolean }) {
  return (
    <div className={isFirst ? "px-6 py-4" : "border-t px-6 py-4"}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <LoadingBar className="h-5 w-5 rounded-full" />
          <LoadingBar className="h-4 w-16" />
          <LoadingBar className="h-4 w-32" />
          <LoadingBar className="h-5 w-16 rounded-full" />
        </div>
        <LoadingBar className="h-7 w-7 rounded-full" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <LoadingBar className="h-3 w-28" />
        <LoadingBar className="h-3 w-20" />
      </div>

      <div className="mt-3 flex items-center gap-4">
        <LoadingBar className="h-4 w-12" />
        <LoadingBar className="h-4 w-4" />
      </div>
    </div>
  );
}

function GuidelineVersionsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <LoadingBar className="h-4 w-32" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <LoadingBar className="h-7 w-96" />
          <LoadingBar className="h-4 w-56" />
        </div>
        <LoadingBar className="h-9 w-32 rounded-md" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="space-y-2 border-b px-6 py-4">
          <LoadingBar className="h-4 w-32" />
          <LoadingBar className="h-3 w-72" />
        </div>

        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <VersionRowSkeleton key={i} isFirst={i === 0} />
          ))}
        </div>
      </Card>
    </div>
  );
}

type DialogState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "rename"; versionId: string; currentNumber: string };

export default function GuidelineVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: guidelineId } = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    number: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: guideline, isLoading } = useQuery({
    queryKey: ["guideline-info", guidelineId],
    queryFn: () => fetchGuidelineInfo(guidelineId),
  });

  const activateMutation = useMutation({
    mutationFn: (versionId: string) =>
      fetch(`/api/guidelines/${guidelineId}/versions/${versionId}/activate`, {
        method: "POST",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["guideline-info", guidelineId],
      }),
  });

  const renameMutation = useMutation({
    mutationFn: ({
      versionId,
      version_number,
    }: {
      versionId: string;
      version_number: string;
    }) =>
      fetch(`/api/guidelines/${guidelineId}/versions/${versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version_number }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to rename version");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["guideline-info", guidelineId],
      });
      setDialogState({ open: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (versionId: string) =>
      fetch(`/api/guidelines/${guidelineId}/versions/${versionId}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["guideline-info", guidelineId],
      }),
  });

  const newVersionMutation = useMutation({
    mutationFn: (versionNumber: string) => {
      const sourceVersionId =
        guideline!.current_version_id ?? guideline!.versions[0]?.id;
      return fetch(`/api/guidelines/${guidelineId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceVersionId, versionNumber }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to create new version");
        }
        return res.json();
      });
    },
    onSuccess: (data) => {
      setDialogState({ open: false });
      router.push(`/guidelines/${guidelineId}/versions/${data.id}`);
    },
  });

  function friendlyDeleteError(raw: string): string {
    if (raw.includes("Cannot delete the active version")) {
      return "This version is currently active and can't be deleted. Mark another version as active first, then try again.";
    }
    return raw;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (err: any) =>
        setDeleteError(
          friendlyDeleteError(err?.message ?? "Failed to delete version"),
        ),
    });
  }
  function friendlyVersionError(raw: string): string {
    if (raw.includes("guideline_versions_guideline_id_version_number_key")) {
      return "A version with that number already exists. Try a different one.";
    }
    return raw;
  }

  function handleDialogSubmit(versionNumber: string) {
    setDialogError(null);
    if (dialogState.open && dialogState.mode === "create") {
      newVersionMutation.mutate(versionNumber, {
        onError: (err: any) =>
          setDialogError(
            friendlyVersionError(
              err?.message ?? "Failed to create new version",
            ),
          ),
      });
    } else if (dialogState.open && dialogState.mode === "rename") {
      renameMutation.mutate(
        { versionId: dialogState.versionId, version_number: versionNumber },
        {
          onError: (err: any) =>
            setDialogError(
              friendlyVersionError(err?.message ?? "Failed to rename version"),
            ),
        },
      );
    }
  }

  if (isLoading) {
    return <GuidelineVersionsSkeleton />;
  }

  if (!guideline) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Guideline not found.</p>
    );
  }

  const sortedVersions = [...guideline.versions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-6 p-6">
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
        <div className="flex items-center gap-">
          <Button
            className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
            onClick={() => setDialogState({ open: true, mode: "create" })}
          >
            <Plus size={16} />
            New version
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b px-6 py-4">
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
              <div
                key={version.id}
                className={i > 0 ? "border-t px-6 py-4" : "px-6 py-4"}
              >
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
                    href={`/guidelines/${guideline.id}/versions/${version.id}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <FileText size={14} />
                    Open
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal size={16} />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      {isActive ? (
                        <Tooltip>
                          <TooltipTrigger render={<span className="block" />}>
                            <DropdownMenuItem disabled>
                              Mark as active
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent>
                            This version is already active
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => activateMutation.mutate(version.id)}
                        >
                          Mark as active
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() =>
                          setDialogState({
                            open: true,
                            mode: "rename",
                            versionId: version.id,
                            currentNumber: version.version_number,
                          })
                        }
                      >
                        Rename version
                      </DropdownMenuItem>

                      {isActive ? (
                        <Tooltip>
                          <TooltipTrigger render={<span className="block" />}>
                            <DropdownMenuItem
                              disabled
                              className="text-destructive focus:text-destructive"
                            >
                              Delete version
                            </DropdownMenuItem>
                          </TooltipTrigger>
                          <TooltipContent>
                            Can't delete the active version — mark another
                            version as active first
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            setDeleteTarget({
                              id: version.id,
                              number: version.version_number,
                            })
                          }
                        >
                          Delete version
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <VersionFormDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ open: false });
            setDialogError(null);
          }
        }}
        mode={dialogState.open ? dialogState.mode : "create"}
        initialValue={
          dialogState.open && dialogState.mode === "rename"
            ? dialogState.currentNumber
            : ""
        }
        isSubmitting={
          dialogState.open && dialogState.mode === "create"
            ? newVersionMutation.isPending
            : renameMutation.isPending
        }
        errorMessage={dialogError}
        onSubmit={handleDialogSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete version"
        description={`Delete version ${deleteTarget?.number}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isConfirming={deleteMutation.isPending}
        errorMessage={deleteError}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
