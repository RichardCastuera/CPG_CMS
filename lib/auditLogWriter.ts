import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
    // Don't throw — a failed audit log write shouldn't fail the parent action
    console.error("[logAction] failed to write audit log entry:", error.message);
  }
}