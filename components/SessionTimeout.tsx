"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // sign out after 15 minutes idle
const WARNING_BEFORE_MS = 60 * 1000; // show warning 1 minute before that
const ACTIVITY_THROTTLE_MS = 5 * 1000; // don't re-broadcast on every event
const STORAGE_KEY = "cpg_last_activity";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

export function SessionTimeout() {
  const router = useRouter();
  const supabase = createClient();
  const [showWarning, setShowWarning] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBroadcastRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    localStorage.removeItem(STORAGE_KEY);
    await supabase.auth.signOut();
    router.push("/login?reason=idle_timeout");
  }, [clearTimers, router, supabase]);

  const armTimers = useCallback(
    (fromTimestamp: number) => {
      clearTimers();
      setShowWarning(false);

      const elapsed = Date.now() - fromTimestamp;
      const warnIn = Math.max(0, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS - elapsed);
      const logoutIn = Math.max(0, IDLE_TIMEOUT_MS - elapsed);

      warnTimerRef.current = setTimeout(() => setShowWarning(true), warnIn);
      logoutTimerRef.current = setTimeout(handleLogout, logoutIn);
    },
    [clearTimers, handleLogout],
  );

  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastBroadcastRef.current < ACTIVITY_THROTTLE_MS) return;
    lastBroadcastRef.current = now;
    localStorage.setItem(STORAGE_KEY, String(now));
    armTimers(now);
  }, [armTimers]);

  // Track whether a session currently exists — only run the idle timer
  // when someone is actually logged in.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setHasSession(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(!!session);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!hasSession) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    // Fresh session start — always begin the idle clock now, never inherit
    // a timestamp from localStorage that could predate this login.
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    armTimers(now);

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true }),
    );

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        armTimers(Number(e.newValue));
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, recordActivity),
      );
      window.removeEventListener("storage", onStorage);
    };
  }, [hasSession, armTimers, clearTimers, recordActivity]);

  return (
    <Dialog
      open={showWarning}
      onOpenChange={(open) => !open && recordActivity()}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Still there?</DialogTitle>
          <DialogDescription>
            You've been inactive for a while. You'll be signed out in a minute
            unless you stay active.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={handleLogout}>
            Sign out now
          </Button>
          <Button
            onClick={recordActivity}
            className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/90"
          >
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
