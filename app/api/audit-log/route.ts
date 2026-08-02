import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(await cookies());
  const { data: logs, error } = await supabase
    .from("audit_log")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Enrich with email via the admin client, since auth.users isn't exposed to normal queries
  const admin = createAdminClient();
  const enriched = await Promise.all(
    logs.map(async (log) => {
      if (!log.actor_id) return { ...log, actorEmail: null };
      const { data } = await admin.auth.admin.getUserById(log.actor_id);
      return { ...log, actorEmail: data.user?.email ?? null };
    })
  );

  return NextResponse.json(enriched);
}