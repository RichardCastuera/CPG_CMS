"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
  save: (payload: T) => Promise<unknown>;
  debounceMs?: number;
  enabled?: boolean; // skip entirely until there's something real to save
}

export function useAutosave<T>(
  payload: T,
  { save, debounceMs = 1500, enabled = true }: UseAutosaveOptions<T>
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const requestIdRef = useRef(0);

  const mutation = useMutation({
    mutationFn: (data: T) => {
      requestIdRef.current += 1;
      const thisRequestId = requestIdRef.current;
      return Promise.resolve(save(data)).then((result) => ({
        result,
        thisRequestId,
      }));
    },
    onMutate: () => {
      setStatus("saving");
    },
    onSuccess: ({ thisRequestId }) => {
      if (thisRequestId === requestIdRef.current) {
        setStatus("saved");
        setLastSavedAt(new Date());
      }
    },
    onError: () => {
      setStatus("error");
    },
  });

  const debouncedSave = useDebouncedCallback((data: T) => {
    mutation.mutate(data);
  }, debounceMs);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!enabled) return;
    debouncedSave(payload);
  }, [payload, enabled, debouncedSave]);

  async function flush() {
    debouncedSave.flush();
  }

  return { status, lastSavedAt, flush };
}