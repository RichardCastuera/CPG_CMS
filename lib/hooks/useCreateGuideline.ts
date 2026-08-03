"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useCreateGuideline() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createGuideline() {
    setCreating(true);
    try {
      const res = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled guideline",
          guideline_type: "Interim",
          version_number: "v1.0",
          source: "authored",
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to create guideline");
      }

      const { id, versionId } = await res.json();
      router.push(`/guidelines/${id}/versions/${versionId}?view=info`);
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  }

  return { createGuideline, creating };
}
