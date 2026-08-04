"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const STRENGTH_OPTIONS = ["Strong", "Weak", "Good Practice Statement"] as const;
const CERTAINTY_OPTIONS = [
  "Very low",
  "Low",
  "Moderate",
  "High",
  "Very low to Low",
  "Low to Moderate",
  "Moderate to High",
  "Low to High",
] as const;

interface ComboboxFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  helperText?: string;
  required?: boolean;
}

function ComboboxField({
  label,
  value,
  options,
  onChange,
  helperText,
  required,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const isUnrecognized =
    value.trim().length > 0 && !options.includes(value as any);

  function commit(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm"
              onClick={() => {
                setDraft(value);
                setOpen(true);
              }}
            >
              <span className={value ? "" : "text-muted-foreground"}>
                {value || "Select or type a value"}
              </span>
              <ChevronDown
                size={14}
                className="text-muted-foreground shrink-0"
              />
            </button>
          }
        />
        <PopoverContent className="w-72 p-3" align="start" sideOffset={6}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a custom value..."
            autoFocus
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(draft.trim());
              }
            }}
          />
          <div className="mt-2 max-h-48 space-y-0.5 overflow-y-auto border-t pt-2">
            {options.filter((opt) =>
              opt.toLowerCase().includes(draft.toLowerCase()),
            ).length === 0 &&
              !draft.trim() && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  No options
                </p>
              )}
            {options
              .filter((opt) => opt.toLowerCase().includes(draft.toLowerCase()))
              .map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => commit(opt)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted ${
                    opt === value ? "bg-muted font-medium" : ""
                  }`}
                >
                  {opt}
                  {opt === value && <span className="text-emerald-600">✓</span>}
                </button>
              ))}
            {draft.trim() && !options.includes(draft.trim() as any) && (
              <button
                type="button"
                onClick={() => commit(draft.trim())}
                className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                <span className="text-xs text-muted-foreground">Use:</span>"
                {draft.trim()}"
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {isUnrecognized ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle size={12} />
          Not a standard value — double check this is correct
        </p>
      ) : (
        helperText && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )
      )}
    </div>
  );
}

interface RecommendationMetaFieldsProps {
  strength: string;
  certainty: string;
  onStrengthChange: (value: string) => void;
  onCertaintyChange: (value: string) => void;
}

export function RecommendationMetaFields({
  strength,
  certainty,
  onStrengthChange,
  onCertaintyChange,
}: RecommendationMetaFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ComboboxField
        label="Strength"
        value={strength}
        options={STRENGTH_OPTIONS}
        onChange={onStrengthChange}
        required
      />
      <ComboboxField
        label="Certainty of evidence"
        value={certainty}
        options={CERTAINTY_OPTIONS}
        onChange={onCertaintyChange}
        helperText="How confident the evidence supports this recommendation"
      />
    </div>
  );
}
