"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";

export interface LibraryReference {
    id: string;
    label: string;
    citation: string;
    doi_or_url: string | null;
    citedIn: string[];
}

export const referenceColumns: ColumnDef<LibraryReference>[] = [
    {
        accessorKey: "label",
        header: "Reference",
        cell: ({ row }) => (
            <div className="flex max-w-md flex-col gap-1">
                <span className="text-sm font-medium">{row.original.label}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                    {row.original.citation}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "doi_or_url",
        header: "DOI / URL",
        cell: ({ row }) => {
            const url = row.original.doi_or_url;
            if (!url) {
                return <span className="text-xs text-muted-foreground">—</span>;
            }
            const linkProps = {
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline",
            };
            return (
                <a {...linkProps}>
                    <ExternalLink size={12} />
                    Link
                </a>
            );
        },
    },
    {
        id: "citedIn",
        header: "Cited in",
        cell: ({ row }) => {
            const cites = row.original.citedIn;
            if (cites.length === 0) {
                return <span className="text-xs text-muted-foreground">Not cited</span>;
            }
            return (
                <span className="text-xs text-muted-foreground">
                    {cites.slice(0, 2).join(", ")}
                    {cites.length > 2 ? ` +${cites.length - 2} more` : ""}
                </span>
            );
        },
    },
];