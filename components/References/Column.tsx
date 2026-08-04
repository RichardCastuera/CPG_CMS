"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface LibraryReference {
  id: string;
  label: string;
  citation: string;
  doi_or_url: string | null;
  citedIn: string[];
}

// Factory so the actions column can call back into the page for delete.
export function getReferenceColumns(
  onDelete: (reference: LibraryReference) => void,
): ColumnDef<LibraryReference>[] {
  return [
    {
      accessorKey: "label",
      header: "Reference",
      cell: ({ row }) => (
        <div className="flex max-w-md flex-col gap-1">
          <span className="text-sm font-medium">{row.original.label}</span>
          <span
            className="block max-w-md truncate text-xs text-muted-foreground"
            title={row.original.citation}
          >
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
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
          >
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
          return (
            <span className="text-xs text-muted-foreground">Not cited</span>
          );
        }
        return (
          <span className="text-xs text-muted-foreground">
            {cites.slice(0, 2).join(", ")}
            {cites.length > 2 ? ` +${cites.length - 2} more` : ""}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 40,
      cell: ({ row }) => {
        const reference = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {reference.doi_or_url && (
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      reference.doi_or_url as string,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  Open link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(reference)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
