"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Boxes,
  Image,
  Table as TableIcon,
  Workflow,
  BarChart3,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useArtifactLibrary } from "@/lib/hooks/useArtifactLibrary";
import { ArtifactCategory } from "@/lib/artifacts";
import { useDebounce } from "use-debounce";
import { ArtifactCard } from "@/components/Artifact/ArtifactCard";
import { useRouter } from "next/navigation";
import { CategoryFilterTabs } from "@/components/Artifact/CaegoryFilterTabs";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingBar } from "@/components/ui/loading-bar";
import StatsCard from "@/components/Cards";

type CategoryFilter = ArtifactCategory | "all";

export default function ArtifactLibraryPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search] = useDebounce(searchInput, 250);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { items, isLoading, totalCount } = useArtifactLibrary({
    category,
    search,
  });

  const router = useRouter();

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const pagedItems = useMemo(() => {
    const start = safePageIndex * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePageIndex, pageSize]);

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  const figureCount = useMemo(
    () => items.filter((i) => i.category === "figure").length,
    [items],
  );
  const tableCount = useMemo(
    () => items.filter((i) => i.category === "table").length,
    [items],
  );
  const flowchartCount = useMemo(
    () => items.filter((i) => i.category === "flowchart").length,
    [items],
  );
  const chartCount = useMemo(
    () => items.filter((i) => i.category === "chart").length,
    [items],
  );
  const pdfCount = useMemo(
    () => items.filter((i) => i.category === "pdf").length,
    [items],
  );

  function handleCategoryChange(next: CategoryFilter) {
    setCategory(next);
    setPageIndex(0);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPageIndex(0);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/artifacts/${id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to delete artifact");
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artifact-library"] });
      setDeleteTarget(null);
    },
  });

  async function handleBulkDelete() {
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/artifacts/${id}`, { method: "DELETE" }),
      ),
    );
    queryClient.invalidateQueries({ queryKey: ["artifact-library"] });
    setSelected({});
    setBulkDeleteOpen(false);
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Artifact Library</h1>
        <p className="text-sm text-muted-foreground">
          Browse figures, tables, and files across all guidelines.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <LoadingBar className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <LoadingBar className="h-6 w-8" />
                    <LoadingBar className="h-3 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard icon={Boxes} label="Total" value={items.length} />
            <StatsCard
              icon={Image}
              label="Figures"
              value={figureCount}
              iconClassName="rounded-lg bg-sky-500/10 p-2 text-sky-600"
            />
            <StatsCard
              icon={TableIcon}
              label="Tables"
              value={tableCount}
              iconClassName="rounded-lg bg-violet-500/10 p-2 text-violet-600"
            />
            <StatsCard
              icon={Workflow}
              label="Flowcharts"
              value={flowchartCount}
              iconClassName="rounded-lg bg-amber-500/10 p-2 text-amber-600"
            />
            <StatsCard
              icon={BarChart3}
              label="Charts"
              value={chartCount}
              iconClassName="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"
            />
            <StatsCard
              icon={FileText}
              label="PDFs"
              value={pdfCount}
              iconClassName="rounded-lg bg-rose-500/10 p-2 text-rose-600"
            />
          </>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artifacts..."
              className="pl-9"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          )}
        </div>

        <CategoryFilterTabs active={category} onChange={handleCategoryChange} />

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 py-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="space-y-3 p-4">
                <LoadingBar className="h-32 w-full" />
                <LoadingBar className="h-4 w-3/4" />
                <LoadingBar className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No artifacts match this search
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {pagedItems.map((item) => (
              <ArtifactCard
                key={item.id}
                name={item.name}
                category={item.category}
                fileFormat={item.fileFormat}
                sizeLabel={item.sizeLabel}
                guidelineVersionLabel={item.guidelineLabel}
                guidelineId={item.guidelineId}
                thumbnailUrl={
                  item.category === "figure" || item.category === "chart"
                    ? item.url
                    : null
                }
                selected={!!selected[item.id]}
                onSelectChange={(v) =>
                  setSelected((prev) => ({ ...prev, [item.id]: v }))
                }
                onPreview={() =>
                  item.url
                    ? window.open(item.url, "_blank")
                    : router.push(`/guidelines/${item.guidelineId}`)
                }
                onDelete={() =>
                  setDeleteTarget({ id: item.id, name: item.name })
                }
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-muted-foreground">
            {totalCount} artifact(s)
          </p>

          {items.length > 0 && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Items per page
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[9, 12, 24, 48].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-sm font-medium">
                Page {safePageIndex + 1} of {pageCount}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageIndex === 0}
                  onClick={() => setPageIndex(0)}
                >
                  <ChevronsLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageIndex === 0}
                  onClick={() => setPageIndex((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageIndex >= pageCount - 1}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePageIndex >= pageCount - 1}
                  onClick={() => setPageIndex(pageCount - 1)}
                >
                  <ChevronsRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete artifact"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete artifacts"
        description={`Delete ${selectedIds.length} artifact(s)? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
