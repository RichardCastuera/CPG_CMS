"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuidelineWithVersions } from "@/constants";

async function fetchGuidelines(): Promise<GuidelineWithVersions[]> {
  const res = await fetch("/api/guidelines");
  if (!res.ok) throw new Error("Failed to load guidelines");
  return res.json();
}

interface GuidelineSelectDropdownProps {
  value: string | undefined;
  onChange: (guidelineId: string | undefined) => void;
}

export function GuidelineSelectDropdown({
  value,
  onChange,
}: GuidelineSelectDropdownProps) {
  const { data: guidelines, isLoading } = useQuery({
    queryKey: ["guidelines-list"],
    queryFn: fetchGuidelines,
  });

  return (
    <Select
      value={value ?? "all"}
      onValueChange={(v) => onChange(v === "all" || v === null ? undefined : v)}
    >
      <SelectTrigger className="w-72">
        <SelectValue placeholder="Select Guideline" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All guidelines</SelectItem>
        {isLoading && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Loading...
          </div>
        )}
        {guidelines?.map((g) => (
          <SelectItem key={g.id} value={g.id}>
            {g.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
