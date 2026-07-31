"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tag...",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...tags, trimmed]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border px-2 py-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-destructive"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
          if (e.key === "Backspace" && draft === "" && tags.length > 0) {
            removeTag(tags[tags.length - 1]); // backspace on empty input removes last tag
          }
        }}
        onBlur={addTag} // commit whatever's typed when focus leaves, like your rename inputs
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[100px] flex-1 bg-transparent text-sm focus:outline-none"
      />
    </div>
  );
}
