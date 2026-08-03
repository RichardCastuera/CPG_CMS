"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeShort } from "@/lib/formatRelativeShort";
import { ReviewActionsMenu } from "./ReviewActionsMenu";

export type ReviewStatus = "in_review" | "changes_requested" | "published";

export interface ReviewRow {
    id: string;
    version_number: string;
    status: ReviewStatus;
    created_at: string;
    guideline_id: string;
    guidelines: { id: string; title: string; guideline_type: string };
    profiles: { name: string } | null;
}

const statusStyles: Record<ReviewStatus, string> = {
    in_review: "bg-amber-100 text-amber-800",
    changes_requested: "bg-rose-100 text-rose-800",
    published: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<ReviewStatus, string> = {
    in_review: "Pending",
    changes_requested: "Changes requested",
    published: "Approved",
};

function sortData(
    column: Column<ReviewRow, unknown>,
    headerTitle: string,
): React.ReactElement {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {headerTitle}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
}

interface GetReviewColumnsHandlers {
    onApprove: (versionId: string) => void;
    onRequestChanges: (row: ReviewRow) => void;
    canReview: boolean;
}

export function getReviewColumns(
    handlers: GetReviewColumnsHandlers,
): ColumnDef<ReviewRow>[] {
    return [
        {
            accessorKey: "guidelines.title",
            header: "CPG",
            cell: ({ row }) => {
                const guideline = row.original.guidelines;
                return (
                    <div className="flex max-w-xs flex-col gap-1">
                        <span className="line-clamp-2 overflow-hidden text-ellipsis font-medium">
                            {guideline.title}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "version_number",
            header: "Version",
            cell: ({ row }) => {
                const { version_number, status } = row.original;
                return (
                    <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                    >
                        {version_number} · {statusLabels[status]}
                    </span>
                );
            },
        },
        {
            accessorKey: "profiles.name",
            header: "Submitted by",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-normal break-words">
                    {row.original.profiles?.name ?? "Unknown"}
                </span>
            ),
        },
        {
            accessorKey: "guidelines.guideline_type",
            header: ({ column }) => sortData(column, "Type"),
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-normal break-words">
                    {row.original.guidelines.guideline_type}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "When",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground whitespace-normal break-words">
                    {formatRelativeShort(row.original.created_at)}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <ReviewActionsMenu
                    review={row.original}
                    canReview={handlers.canReview}
                    onApprove={handlers.onApprove}
                    onRequestChanges={handlers.onRequestChanges}
                />
            ),
        },
    ];
}
