import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface AuditLogEntry {
  id: string;
  created_at: string;
  actor_id: string | null;
  action: string;
  target: string;
  guideline_id: string | null;
  profiles?: { name: string } | null;
  actorEmail?: string | null;
}

interface LogActionParams {
  actorId: string;
  action: string;
  target: string;
  guidelineId?: string;
}

export async function logAction({
  actorId,
  action,
  target,
  guidelineId,
}: LogActionParams) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    target,
    guideline_id: guidelineId ?? null,
  });

  if (error) {
    console.error("[logAction] failed to write audit log entry:", error.message);
  }
}