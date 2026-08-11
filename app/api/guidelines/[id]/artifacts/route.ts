import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

function withPublicUrls(
  supabase: ReturnType<typeof createClient>,
  artifacts: any[]
) {
  return artifacts.map((artifact) => {
    const { data } = supabase.storage
      .from("artifacts")
      .getPublicUrl(artifact.storage_path);
    return { ...artifact, url: data?.publicUrl ?? null };
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data: artifacts, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("guideline_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const withUrls = withPublicUrls(supabase, artifacts);
  return NextResponse.json(withUrls);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = formData.get("category") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "No category provided" }, { status: 400 });
  }

  const storagePath = `${id}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("artifacts")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: artifact, error: insertError } = await supabase
    .from("artifacts")
    .insert({
      guideline_id: id,
      name: file.name,
      category,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from("artifacts").remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const [withUrl] = withPublicUrls(supabase, [artifact]);
  return NextResponse.json(withUrl);
}