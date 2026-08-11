import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";


function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function GET() {
  const supabase = createClient(await cookies());

  const { data: artifacts, error } = await supabase
    .from("artifacts")
    .select("*, guidelines(title, short_title)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const enriched = artifacts.map((a: any) => {
  const { data } = supabase.storage.from("artifacts").getPublicUrl(a.storage_path);
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    fileFormat: a.mime_type?.split("/").pop()?.toUpperCase() ?? "FILE",
    sizeLabel: formatSize(a.size_bytes),
    guidelineLabel: a.guidelines?.short_title ?? a.guidelines?.title ?? "Unknown",
    guidelineId: a.guideline_id,
    url: a.storage_path ? data?.publicUrl ?? null : null,
  };
});

return NextResponse.json(enriched);

}