"use client";

import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FolderOpen, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { ReviewRow } from "./Columns";

interface ReviewActionsMenuProps {
    review: ReviewRow;
    canReview: boolean;
    onApprove: (versionId: string) => void;
    onRequestChanges: (row: ReviewRow) => void;
}

export function ReviewActionsMenu({
    review,
    canReview,
    onApprove,
    onRequestChanges,
}: ReviewActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    render={<Link href={`/guidelines/${review.guideline_id}/versions/${review.id}`} />}
                >
                    <FolderOpen size={14} className="mr-2" />
                    Open
                </DropdownMenuItem>
                {canReview && review.status === "in_review" && (
                    <>
                        <DropdownMenuItem onClick={() => onApprove(review.id)}>
                            <CheckCircle2 size={14} className="mr-2" />
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRequestChanges(review)}>
                            <MessageSquareWarning size={14} className="mr-2" />
                            Request changes
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}