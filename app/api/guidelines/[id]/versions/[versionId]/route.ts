import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { versionId } = await params;
  const body = await req.json(); // { version_number: string }
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("guideline_versions")
    .update({ version_number: body.version_number })
    .eq("id", versionId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params;
  const supabase = createClient(await cookies());

  const { error } = await supabase.rpc("delete_guideline_version", {
    p_version_id: versionId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}