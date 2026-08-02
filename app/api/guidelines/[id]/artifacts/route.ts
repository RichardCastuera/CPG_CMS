import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

async function withSignedUrls(
  supabase: ReturnType<typeof createClient>,
  artifacts: any[]
) {
  return Promise.all(
    artifacts.map(async (artifact) => {
      const { data } = await supabase.storage
        .from("artifacts")
        .createSignedUrl(artifact.storage_path, SIGNED_URL_EXPIRY_SECONDS);
      return { ...artifact, url: data?.signedUrl ?? null };
    })
  );
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

  const withUrls = await withSignedUrls(supabase, artifacts);
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

  const [withUrl] = await withSignedUrls(supabase, [artifact]);
  return NextResponse.json(withUrl);
}