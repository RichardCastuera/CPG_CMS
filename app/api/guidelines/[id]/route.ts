import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { logAction } from "@/lib/auditLogWriter";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: guideline, error: fetchError } = await supabase
    .from("guidelines")
    .select("title")
    .eq("id", id)
    .single();

  const { error: deleteError } = await supabase
    .from("guidelines")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  if (guideline?.title) {
    await logAction({
      actorId: user.id,
      action: "deleted guideline",
      target: guideline.title,
      guidelineId: id,
    });
  }

  return NextResponse.json({ ok: true });
}

