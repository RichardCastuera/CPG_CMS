import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

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

  const enriched = await Promise.all(
    artifacts.map(async (a: any) => {
      const { data: signed } = await supabase.storage
        .from("artifacts")
        .createSignedUrl(a.storage_path, SIGNED_URL_EXPIRY_SECONDS);

      return {
        id: a.id,
        name: a.name,
        category: a.category,
        fileFormat: a.mime_type?.split("/").pop()?.toUpperCase() ?? "FILE",
        sizeLabel: formatSize(a.size_bytes),
        guidelineLabel: a.guidelines?.short_title ?? a.guidelines?.title ?? "Unknown",
        guidelineId: a.guideline_id,
        url: signed?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json(enriched);
}