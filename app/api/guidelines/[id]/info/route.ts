import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { GuidelineWithVersions } from "@/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("guidelines")
    .select("*, versions:guideline_versions!guideline_versions_guideline_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Guideline not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: GuidelineWithVersions = await req.json();
  const supabase = createClient(await cookies());

  // status is intentionally excluded — status transitions (on both the
  // guideline and its versions) must go through the sanctioned RPCs
  // (submit_or_publish_guideline, approve_guideline_version,
  // admin_force_publish), never through this general-purpose autosave PUT.
  const { versions, id: _id, created_at, updated_at, status, ...guidelineFields } = body;

  const { error: guidelineError } = await supabase
    .from("guidelines")
    .update({ ...guidelineFields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (guidelineError) {
    return NextResponse.json({ error: guidelineError.message }, { status: 400 });
  }

  // Sync per-version metadata edited from the info panel's version timeline —
  // status excluded for the same reason as above.
  if (Array.isArray(versions)) {
    for (const v of versions) {
      const { status: _versionStatus, ...versionFields } = v;
      await supabase
        .from("guideline_versions")
        .update({
          version_number: versionFields.version_number,
          changelog: versionFields.changelog,
          effective_date: versionFields.effective_date,
        })
        .eq("id", v.id)
        .eq("guideline_id", id);
    }
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}