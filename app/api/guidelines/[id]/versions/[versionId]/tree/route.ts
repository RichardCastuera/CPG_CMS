import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { GuidelineTree, NodeStatus } from "@/lib/guidelineTree";

function toTsStatus(status: string): NodeStatus {
  return status.replace("_", "-") as NodeStatus;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { versionId } = await params;
  const supabase = createClient(await cookies());

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("version_id", versionId)
    .order("sort_order");

  if (sectionsError) {
    return NextResponse.json({ error: sectionsError.message }, { status: 400 });
  }

  const sectionIds = sections.map((s) => s.id);
  const { data: questions, error: questionsError } = sectionIds.length
    ? await supabase
        .from("questions")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order")
    : { data: [], error: null };

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 400 });
  }

  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: recommendations, error: recommendationsError } = questionIds.length
    ? await supabase
        .from("recommendations")
        .select("*")
        .in("question_id", questionIds)
        .order("sort_order")
    : { data: [], error: null };

  if (recommendationsError) {
    return NextResponse.json({ error: recommendationsError.message }, { status: 400 });
  }

  const tree: GuidelineTree = {
    sections: sections.map((s) => ({
      id: s.id,
      type: "section",
      title: s.title,
      status: toTsStatus(s.status),
      overview: s.overview ?? undefined,
      children: (questions ?? [])
        .filter((q) => q.section_id === s.id)
        .map((q) => ({
          id: q.id,
          type: "question",
          title: q.title,
          status: toTsStatus(q.status),
          clinicalQuestion: q.clinical_question ?? undefined,
          background: q.background ?? undefined,
          children: (recommendations ?? [])
            .filter((r) => r.question_id === q.id)
            .map((r) => ({
              id: r.id,
              type: "recommendation",
              title: r.title,
              number: r.number ?? "",
              status: toTsStatus(r.status),
              strength: r.strength ?? undefined,
              certaintyOfEvidence: r.certainty_of_evidence ?? undefined,
              statement: r.statement ?? undefined,
            })),
        })),
    })),
  };

  return NextResponse.json(tree);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { versionId } = await params;
  const body = await req.json();
  const supabase = createClient(await cookies());

  const { error } = await supabase.rpc("replace_guideline_tree", {
    p_version_id: versionId,
    p_tree: body,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}