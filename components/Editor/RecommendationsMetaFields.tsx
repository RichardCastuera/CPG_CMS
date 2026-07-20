"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const STRENGTH_OPTIONS = ["Strong", "Weak"] as const;
const CERTAINTY_OPTIONS = ["Very low", "Low", "Moderate", "High"] as const;

type Strength = (typeof STRENGTH_OPTIONS)[number];
type Certainty = (typeof CERTAINTY_OPTIONS)[number];

interface RecommendationMetaFieldsProps {
  strength: Strength;
  certainty: Certainty;
  onStrengthChange: (value: Strength) => void;
  onCertaintyChange: (value: Certainty) => void;
}

const STRENGTH_BADGE_STYLES: Record<Strength, string> = {
  Strong: "border-emerald-600 text-emerald-700 bg-emerald-50",
  Weak: "border-amber-500 text-amber-700 bg-amber-50",
};

export function RecommendationMetaFields({
  strength,
  certainty,
  onStrengthChange,
  onCertaintyChange,
}: RecommendationMetaFieldsProps) {
  const certaintyIndex = CERTAINTY_OPTIONS.indexOf(certainty); // 0-3

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
          Strength <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={strength}
            onChange={(e) => onStrengthChange(e.target.value as Strength)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          >
            {STRENGTH_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              STRENGTH_BADGE_STYLES[strength],
            )}
          >
            {strength}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Certainty of evidence
        </label>
        <div className="flex items-center gap-2">
          <select
            value={certainty}
            onChange={(e) => onCertaintyChange(e.target.value as Certainty)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          >
            {CERTAINTY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex gap-0.5">
              {CERTAINTY_OPTIONS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i <= certaintyIndex ? "bg-[#2F6B4F]" : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{certainty}</span>
          </div>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Info size={12} />
          How confident the evidence supports this recommendation
        </p>
      </div>
    </div>
  );
}
