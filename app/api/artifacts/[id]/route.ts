import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data: artifact, error: fetchError } = await supabase
    .from("artifacts")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("artifacts")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  await supabase.storage.from("artifacts").remove([artifact.storage_path]);

  return NextResponse.json({ ok: true });
}