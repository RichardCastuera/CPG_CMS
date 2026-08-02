import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { logAction } from "@/lib/auditLogWriter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { id, versionId } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: guideline, error } = await supabase
    .from("guidelines")
    .update({ current_version_id: versionId })
    .eq("id", id)
    .select("title")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAction({
    actorId: user.id,
    action: "marked version as active",
    target: guideline.title,
    guidelineId: id,
  });

  return NextResponse.json({ ok: true });
}