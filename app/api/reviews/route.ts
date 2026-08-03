import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
  .from("guideline_versions")
  .select(
    "*, guidelines!guideline_versions_guideline_id_fkey(id, title, guideline_type), profiles!guideline_versions_created_by_fkey(name)"
  )
  .in("status", ["in_review", "changes_requested", "published"])
  .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}