import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { logAction } from "@/lib/auditLogWriter";

export async function GET() {
  const supabase = createClient(await cookies());
  const { data: guidelines, error } = await supabase
    .from("guidelines")
    .select("*, versions:guideline_versions!guideline_versions_guideline_id_fkey(*)");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(guidelines);
}

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { version_number, effective_date, source, ...guidelineFields } = body;

  // Server-side enforcement, not just a hidden form field: an "authored"
  // guideline can only ever start as draft, regardless of what's sent.
  const resolvedStatus = source === "imported" ? guidelineFields.status : "draft";

  const { data: guideline, error: guidelineError } = await supabase
    .from("guidelines")
    .insert({
      ...guidelineFields,
      status: resolvedStatus,
      source: source ?? "authored",
      created_by: user.id,
    })
    .select()
    .single();

  if (guidelineError) {
    return NextResponse.json({ error: guidelineError.message }, { status: 400 });
  }

  const { data: version, error: versionError } = await supabase
    .from("guideline_versions")
    .insert({
      guideline_id: guideline.id,
      version_number,
      effective_date: effective_date || null,
      status: mapGuidelineStatusToVersionStatus(resolvedStatus),
      created_by: user.id,
    })
    .select()
    .single();

  if (versionError) {
    await supabase.from("guidelines").delete().eq("id", guideline.id);
    return NextResponse.json({ error: versionError.message }, { status: 400 });
  }

  const { error: linkError } = await supabase
    .from("guidelines")
    .update({ current_version_id: version.id })
    .eq("id", guideline.id);

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 });
  }

  await logAction({
    actorId: user.id,
    action: source === "imported" ? "imported guideline" : "created guideline",
    target: guideline.title,
    guidelineId: guideline.id,
  });

  return NextResponse.json({ id: guideline.id, versionId: version.id });
}

function mapGuidelineStatusToVersionStatus(
  status: string
): "draft" | "in_review" | "published" | "superseded" {
  if (status === "archived") return "superseded";
  return status as "draft" | "in_review" | "published";
}