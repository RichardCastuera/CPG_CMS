import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("guideline_versions")
    .select(
      "*, guidelines!guideline_versions_guideline_id_fkey!inner(id, title, guideline_type, created_by, profiles(name))"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data
    .filter(
      (v: any) =>
        v.status === "in_review" ||
        v.status === "published" ||
        (v.status === "draft" && v.review_note),
    )
    .map((v: any) => ({
      id: v.id,
      version_number: v.version_number,
      status: v.status === "draft" ? "changes_requested" : v.status,
      created_at: v.created_at,
      review_note: v.review_note,
      guideline_id: v.guidelines.id,
      guidelines: {
        id: v.guidelines.id,
        title: v.guidelines.title,
        guideline_type: v.guidelines.guideline_type,
      },
      profiles: v.guidelines.profiles ?? null,
    }));

  return NextResponse.json(rows);
}