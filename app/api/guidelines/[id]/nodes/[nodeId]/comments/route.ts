import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  const { id: guidelineId, nodeId } = await params;
  const { body, nodeType } = await req.json(); // nodeType: "section" | "question" | "recommendation"

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const columnMap = {
    section: "section_id",
    question: "question_id",
    recommendation: "recommendation_id",
  } as const;

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      [columnMap[nodeType as keyof typeof columnMap]]: nodeId,
      guideline_id: guidelineId,
      author_id: user.id,
      body,
    })
    .select("*, profiles(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(comment);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  const { nodeId } = await params;
  const supabase = createClient(await cookies());

  // nodeId could be a section, question, or recommendation — check all three columns
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(name)")
    .or(`section_id.eq.${nodeId},question_id.eq.${nodeId},recommendation_id.eq.${nodeId}`)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}