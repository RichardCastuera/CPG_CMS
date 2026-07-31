import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("admin_force_publish", { g_id: id });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
