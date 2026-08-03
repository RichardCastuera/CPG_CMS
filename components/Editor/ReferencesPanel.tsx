"use client";

import { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import {
  AttachedReference,
  Reference,
  NewReferenceInput,
} from "@/lib/references";
import { NewReferenceDialog } from "../References/NewReferenceDialog";

interface ReferencesPanelProps {
  attached: AttachedReference[];
  searchResults: Reference[];
  isSearching: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  attach: (referenceId: string) => void;
  detach: (referenceId: string) => void;
  createAndAttach: (input: NewReferenceInput) => void;
  isCreating?: boolean;
}

export function ReferencesPanel({
  attached,
  searchResults,
  isSearching,
  query,
  onQueryChange,
  attach,
  detach,
  createAndAttach,
  isCreating = false,
}: ReferencesPanelProps) {
  const [newRefOpen, setNewRefOpen] = useState(false);

  function handleCreate(input: NewReferenceInput) {
    createAndAttach(input);
    setNewRefOpen(false);
  }

  return (
    <div className="space-y-4 p-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Attached
        </p>
        <div className="flex flex-wrap gap-2">
          {attached.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No references attached yet
            </p>
          )}
          {attached.map((ref) => (
            <span
              key={ref.id}
              className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
            >
              {ref.order}. {ref.label}
              <button
                onClick={() => detach(ref.id)}
                className="hover:text-destructive"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Add reference
          </p>
          <button
            onClick={() => setNewRefOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            <Plus size={12} /> New
          </button>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-2.5 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search citations"
            className="w-full rounded-md border py-2 pl-8 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        {isSearching && (
          <p className="text-xs text-muted-foreground">Searching...</p>
        )}
        {!isSearching && query.trim().length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Start typing to search the citation library
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or{" "}
              <button
                onClick={() => setNewRefOpen(true)}
                className="font-medium text-emerald-700 hover:underline"
              >
                add a new reference
              </button>
            </p>
          </div>
        )}
        {!isSearching &&
          query.trim().length > 0 &&
          searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No matches — try a different search, or{" "}
              <button
                onClick={() => setNewRefOpen(true)}
                className="font-medium text-emerald-700 hover:underline"
              >
                add a new reference
              </button>
              .
            </p>
          )}
        {!isSearching &&
          searchResults.map((ref) => (
            <button
              key={ref.id}
              onClick={() => attach(ref.id)}
              className="block w-full rounded-md border p-2 text-left hover:bg-muted"
            >
              <p className="text-sm font-medium text-emerald-700">
                {ref.label}
              </p>
              <p className="text-xs text-muted-foreground">{ref.citation}</p>
            </button>
          ))}
      </div>

      <NewReferenceDialog
        open={newRefOpen}
        onOpenChange={setNewRefOpen}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
}
