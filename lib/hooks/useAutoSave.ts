"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { GuidelineTree } from "@/lib/guidelineTree";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  guidelineId: string;
  debounceMs?: number;
}

async function saveGuidelineTree(guidelineId: string, tree: GuidelineTree) {
  const res = await fetch(`/api/guidelines/${guidelineId}/tree`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tree),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

export function useAutosave(
  tree: GuidelineTree,
  { guidelineId, debounceMs = 1500 }: UseAutosaveOptions
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Guards against out-of-order responses: if the tree changes again while
  // a save is in flight, an older response landing later must not flip
  // status back to "saved" and stomp on the newer "saving" state.
  const requestIdRef = useRef(0);

  const mutation = useMutation({
    mutationFn: (payload: GuidelineTree) => {
      requestIdRef.current += 1;
      const thisRequestId = requestIdRef.current;
      return saveGuidelineTree(guidelineId, payload).then((result) => ({
        result,
        thisRequestId,
      }));
    },
    onMutate: () => {
      setStatus("saving");
    },
    onSuccess: ({ thisRequestId }) => {
      // Only trust this response if nothing newer has been kicked off since
      if (thisRequestId === requestIdRef.current) {
        setStatus("saved");
        setLastSavedAt(new Date());
      }
    },
    onError: (_err, _payload) => {
      setStatus("error");
    },
  });

  const debouncedSave = useDebouncedCallback((payload: GuidelineTree) => {
    mutation.mutate(payload);
  }, debounceMs);

  // Track whether this is the very first render, so we don't fire a save
  // the instant the page loads with the initial tree
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    debouncedSave(tree);
  }, [tree, debouncedSave]);

  // Flush any pending debounced save immediately — used for the Publish
  // button, so we never publish against stale unsaved tree state
  async function flush() {
    debouncedSave.flush();
  }

  return { status, lastSavedAt, flush };
}