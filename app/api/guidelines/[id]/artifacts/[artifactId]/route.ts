import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const { artifactId } = await params;
  const body = await req.json(); // { caption: string }
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("artifacts")
    .update({ caption: body.caption })
    .eq("id", artifactId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: signed } = await supabase.storage
    .from("artifacts")
    .createSignedUrl(data.storage_path, 60 * 60);

  return NextResponse.json({ ...data, url: signed?.signedUrl ?? null });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const { artifactId } = await params;
  const supabase = createClient(await cookies());

  const { data: artifact, error: fetchError } = await supabase
    .from("artifacts")
    .select("storage_path")
    .eq("id", artifactId)
    .single();

  if (fetchError || !artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("artifacts")
    .delete()
    .eq("id", artifactId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  await supabase.storage.from("artifacts").remove([artifact.storage_path]);

  return NextResponse.json({ ok: true });
}