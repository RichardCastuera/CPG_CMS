"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Author } from "@/constants";

interface AuthorsListProps {
  authors: Author[];
  onChange: (authors: Author[]) => void;
}

export function AuthorsList({ authors, onChange }: AuthorsListProps) {
  function addAuthor() {
    onChange([...authors, { name: "", position: "", affiliation: "" }]);
  }

  function updateAuthor(index: number, field: keyof Author, value: string) {
    onChange(
      authors.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  }

  function removeAuthor(index: number) {
    onChange(authors.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Authors & panel members</p>
          <p className="text-xs text-muted-foreground">
            Contributors listed on the published document
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={addAuthor}
        >
          <Plus size={14} />
          Add author
        </Button>
      </div>

      <div className="space-y-2">
        {authors.map((author, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={author.name}
              onChange={(e) => updateAuthor(index, "name", e.target.value)}
              placeholder="Dr. Jane Smith"
              className="flex-1"
            />
            <Input
              value={author.position}
              onChange={(e) => updateAuthor(index, "position", e.target.value)}
              placeholder="Chair, Pediatric ID"
              className="flex-1"
            />
            <Input
              value={author.affiliation ?? ""}
              onChange={(e) =>
                updateAuthor(index, "affiliation", e.target.value)
              }
              placeholder="Affiliation (optional)"
              className="flex-1"
            />
            <button
              onClick={() => removeAuthor(index)}
              className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
